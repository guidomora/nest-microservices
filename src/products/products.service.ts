import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagintation.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('Products services')

  onModuleInit() {
    this.$connect()
    this.logger.log('db');

  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    })
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto

    const totalProducts = await this.product.count({where:{available:true}})
    const lastPage = Math.ceil(totalProducts / limit)

    const productPagination = await this.product.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where:{available:true}
    })

    if (productPagination.length === 0) return "The page does not exists"

    return {
      data: productPagination,
      meta: {
        page,
        total: totalProducts,
        lastPage
      }
    }
  }

  async findOne(id: number) {

    const product = await this.product.findFirst({
      where: {
        id
      }
    })

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`)
    }
    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const {id: __, ...data} = updateProductDto


    // this makes a double call. also can be done with a trycatch
    await this.findOne(id)

    return this.product.update({
      where: { id, available:true },
      data
    })
  }

  async remove(id: number) {
    // this makes a double call. also can be done with a trycatch
    await this.findOne(id)

    // return this.product.delete({
    //   where: {
    //     id
    //   }
    // })

    return this.product.update({
      where: { id },
      data: { available: false }
    })
  }
}
