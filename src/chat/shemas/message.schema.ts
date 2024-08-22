import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  clientId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  text: string;

  @Prop({ default: null })
  deletedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.pre('findOne', async function (next: NextFunction) {
  this.where({ deletedAt: null });
  next();
});

MessageSchema.pre('find', async function (next: NextFunction) {
  this.where({ deletedAt: null });
  next();
});
