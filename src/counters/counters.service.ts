import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCounterDto } from './dto/create-counter.dto';
import { DynamoDB } from 'aws-sdk';

@Injectable()
export class CountersService {
  db = new DynamoDB.DocumentClient({
    region: "ca-central-1"
  })

  create(createCounterDto: CreateCounterDto) {
  }

  findAll() {
    this.db.scan(
      {
        TableName: "counters",
        Limit: 100,
        ConsistentRead: true,
      },
      (error, output) => {
        if (error) {
          console.error([error, new Date()])
          throw new HttpException("Please try again later.", HttpStatus.INTERNAL_SERVER_ERROR)
        } else {
          let counters = []

          output.Items.map((item) => { 
            console.log(item)
            return { [item.id]: item.value }
          })

          return counters
        }
      }
    )
  }

  findOne(id: string) {
  }

  increment(id: string) {
  }

  remove(id: string) {
    return `This action removes a #${id} counter`;
  }
}
