import { Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export default class Candle {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  timestamp: number;

  @Column()
  open: number;

  @Column()
  high: number;

  @Column()
  low: number;

  @Column()
  close: number;

  @Column()
  volume: number;
}

