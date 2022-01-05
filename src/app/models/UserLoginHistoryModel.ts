import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { LoginSourceType, LoginType, PlatformType } from '../contract/constants'
import User from './UserModel'

@Entity()
export default class UserLoginHistory {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => User)
  user: User

  @Column({ type: 'varchar', name: 'userAgent' })
  userAgent: string

  @Column({ type: 'varchar', name: 'ipAddress', nullable: true })
  ipAddress: string | null

  @Column({ type: 'varchar', name: 'dimension' })
  dimension: string

  @Column({ type: 'enum', enum: Object.values(LoginType), name: 'loginType' })
  loginType: LoginType

  @Column({ type: 'enum', enum: Object.values(LoginSourceType), name: 'loginSource' })
  loginSource: LoginSourceType

  @Column({ type: 'enum', enum: Object.values(PlatformType), name: 'platform' })
  platform: PlatformType

  @Column({ type: 'varchar', name: 'url' })
  url: string

  @Column({ type: 'timestamp', name: 'sessionExpiry' })
  sessionExpiry: Date

  @Column({ type: 'varchar', name: 'networkType', nullable: true })
  networkType: string | null

  @Column({ type: 'varchar', name: 'networkEffectiveType', nullable: true })
  networkEffectiveType: string | null

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
