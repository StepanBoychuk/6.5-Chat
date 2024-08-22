import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './shemas/user.schema';
import { Message } from './shemas/message.schema';
import { CreateMessageDto } from './dto/createMessage.dto';
import { UpdateMessageDto } from './dto/updateMessageDto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('User') private userModel: mongoose.Model<User>,
    @InjectModel('Message') private messageModel: mongoose.Model<Message>,
  ) {}

  async ifUsernameTaken(username: string): Promise<User> {
    return await this.userModel.findOne({ username: username });
  }

  async getUsersList(): Promise<User[]> {
    return this.userModel.find({}, 'username clientId');
  }

  async saveUser(username: string, clientId: string): Promise<User> {
    const user = new this.userModel({ username: username, clientId: clientId });
    return await user.save();
  }

  async deleteUser(clientId: string): Promise<User> {
    return await this.userModel.findOneAndUpdate(
      { clientId: clientId },
      { deletedAt: Date.now() },
    );
  }

  async saveMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = new this.messageModel(createMessageDto);
    return await message.save();
  }

  async findMessageById(messageId: string): Promise<Message> {
    try {
      return await this.messageModel.findById(messageId);
    } catch (error) {
      if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return;
      }
    }
  }

  async updateMessage(updateMessageDto: UpdateMessageDto): Promise<Message> {
    return await this.messageModel.findByIdAndUpdate(
      updateMessageDto.messageId,
      { text: updateMessageDto.text },
      { new: true },
    );
  }

  async deleteMessage(messageId: string): Promise<Message> {
    return await this.messageModel.findByIdAndUpdate(
      messageId,
      {
        deletedAt: Date.now(),
      },
      { new: true },
    );
  }
}
