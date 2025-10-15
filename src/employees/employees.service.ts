import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

@Injectable()
export class EmployeesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  /** ✅ CREATE EMPLOYEE **/
  async create(employeeDto: CreateEmployeeDto) {
    try {
      const [employee] = await this.database
        .insert(schema.employees)
        .values(employeeDto as typeof schema.employees.$inferInsert)
        .returning();

      return {
        message: '✅ Employee created successfully',
        data: employee,
      };
    } catch {
      throw new BadRequestException(
        'Failed to create employee. Check your input.',
      );
    }
  }

  /** ✅ GET ALL EMPLOYEES **/
  async findAll() {
    return this.database.query.employees.findMany({
      orderBy: (employees, { desc }) => [desc(employees.created_at)],
    });
  }

  /** ✅ GET EMPLOYEE BY ID **/
  async findOne(id: number) {
    const employee = await this.database.query.employees.findFirst({
      where: eq(schema.employees.id, id),
    });

    if (!employee) {
      throw new NotFoundException(`Employee #${id} not found`);
    }

    return employee;
  }

  /** ✅ UPDATE EMPLOYEE **/
  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const [updated] = await this.database
      .update(schema.employees)
      .set({
        ...updateEmployeeDto,
        updated_at: new Date(),
      })
      .where(eq(schema.employees.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Employee #${id} not found`);
    }

    return {
      message: '✅ Employee updated successfully',
      data: updated,
    };
  }

  /** ✅ DELETE EMPLOYEE **/
  async remove(id: number) {
    const [deleted] = await this.database
      .delete(schema.employees)
      .where(eq(schema.employees.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Employee #${id} not found`);
    }

    return {
      message: '🗑️ Employee deleted successfully',
      data: deleted,
    };
  }
}
