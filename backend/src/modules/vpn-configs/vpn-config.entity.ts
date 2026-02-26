import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('vpn_configs')
export class VpnConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  configuration: string;

  @OneToOne(() => User, (user) => user.assignedVpnConfig, { nullable: true })
  @JoinColumn({ name: 'assigned_user_id' })
  assignedUser: User | null;

  @Column({ name: 'assigned_at', type: 'timestamp', nullable: true })
  assignedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
