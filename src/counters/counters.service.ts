import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCounterDto } from './dto/create-counter.dto';
import { DynamoDB } from 'aws-sdk';
import { Counter } from './entities/counter.entity';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';

@Injectable()
export class CountersService {
  db = new DynamoDB.DocumentClient({
    region: "ca-central-1"
  })

  async create(createCounterDto: CreateCounterDto) {
    if(createCounterDto[Object.keys(createCounterDto)[0]] === undefined || createCounterDto[Object.keys(createCounterDto)[0]] <= 0) {
      throw new BadRequestException()
    }

    let output = await this.db.put({
      TableName: "counters",
      Item: {
        "id": Object.keys(createCounterDto)[0],
        "value": createCounterDto[Object.keys(createCounterDto)[0]]
      }
    })
    .promise()
    .catch(reason => {
      console.error([reason, new Date()])
      throw new InternalServerErrorException("Could not create the counter at this moment, please try again later!")
    })
  }

  async findAll(): Promise<Counter[]> {
    const output = await this.db.scan({
      TableName: "counters",
      Limit: 100,
      ConsistentRead: true,
    }).promise()

    return output.Items.map((item) => {
      return new Counter(item.id, item.value)
    })
  }

  async findOne(id: string): Promise<Counter> {
    let output = await this.db.get({
      TableName: "counters",
      Key: {
        "id": id
      }
    }).promise()

    if(output.Item) {
      return new Counter(output.Item.id, output.Item.value)
    } else {
      throw new NotFoundException()
    }
  }

  async increment(id: string) {
    await this.db.update({
      TableName: "counters",
      Key: {
        "id": id
      },
      UpdateExpression: "add #valueField :step",
      ConditionExpression: 'attribute_exists(#valueField)',
      ExpressionAttributeValues: {
        ":step": 1
      },
      ExpressionAttributeNames: {
        "#valueField": "value"
      },
      ReturnValues: "NONE"
    })
    .promise()
    .catch(reason => {
      if (reason.code === 'ConditionalCheckFailedException') {
        throw new NotFoundException()
      } else {
        console.error([reason, new Date()])
        throw new InternalServerErrorException("Could not retrieve counters at this moment, please try again later!")
      }
    })
  }

  async remove(id: string) {
    let item = await this.findOne(id)
    console.log(item)

    if(item[id] <= 0) {
      await this.db.delete({
        TableName: 'counters',
        Key: {
          'id': id
        }
      }).promise()
      .catch(reason => {
        console.error([reason, new Date()])
        throw new InternalServerErrorException("Could not retrieve counters at this moment, please try again later!")
      })
    } else {
      await this.db.update({
        TableName: "counters",
        Key: {
          "id": id
        },
        UpdateExpression: "set #valueField = :value",
        ConditionExpression: 'attribute_exists(#valueField)',
        ExpressionAttributeValues: {
          ":value": item[id] - 1
        },
        ExpressionAttributeNames: {
          "#valueField": "value"
        },
        ReturnValues: "NONE"
      })
      .promise()
      .catch(reason => {
        if (reason.code === 'ConditionalCheckFailedException') {
          throw new NotFoundException()
        } else {
          console.error([reason, new Date()])
          throw new InternalServerErrorException("Could not retrieve counters at this moment, please try again later!")
        }
      })
    }
  }
}
