import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Res } from '@nestjs/common';
import { CountersService } from './counters.service';
import { CreateCounterDto } from './dto/create-counter.dto';

@Controller('counters')
export class CountersController {
  constructor(private readonly countersService: CountersService) {}

  @Post()
  create(@Body() createCounterDto: CreateCounterDto) {
    return this.countersService.create(createCounterDto);
  }

  @Get()
  findAll() {
    let data = this.countersService.findAll();
    console.log(data)
    return data
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.countersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string) {
    return this.countersService.increment(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.countersService.remove(id);
  }
}
