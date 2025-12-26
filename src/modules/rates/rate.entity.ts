import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rates')
@Index(['base', 'code'], { unique: true })
export class Rate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 3 })
  base!: string; 

  @Column({ type: 'varchar', length: 3 })
  code!: string; 

  @Column({ type: 'numeric', precision: 18, scale: 6 })
  value!: string; 

  @CreateDateColumn()
  updatedAt!: Date;
}
