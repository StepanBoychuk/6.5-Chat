import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  clientId: string;
  @Prop({ required: true })
  username: string;
  @Prop({ default: null })
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('findOne', async function (next: NextFunction) {
  this.where({ deletedAt: null });
  next();
});

UserSchema.pre('find', async function (next: NextFunction) {
  this.where({ deletedAt: null });
  next();
});
