import { getRepository, MigrationInterface, QueryRunner } from 'typeorm';
import { User } from '../entity/User';

export class CreateAdminUser1608321167483 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const user = new User();
    user.mail = 'admin';
    user.password = 'admin';
    user.firstname = 'admin';
    user.lastname = 'admin';
    user.admin = true;
    const userRepository = getRepository(User);
    await userRepository.save(user);
  }

  public async down(queryRunner: QueryRunner): Promise<any> { }
}