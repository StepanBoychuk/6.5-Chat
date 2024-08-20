import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket, Server } from 'socket.io';
import { CreateMessageDto } from './dto/createMessage.dto';
import { UpdateMessageDto } from './dto/updateMessageDto';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private chatService: ChatService) {}
  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    const username = client.handshake.query.username as string;
    if (!username) {
      client.emit('error', 'Please set your username.');
      return client.disconnect();
    }
    const user = await this.chatService.ifUsernameTaken(username);
    if (user) {
      client.emit(
        'error',
        'User with this username is already in chat room. Please try another username.',
      );
      return client.disconnect();
    }
    const usersList = await this.chatService.getUsersList();
    await this.chatService.saveUser(username, client.id);

    client.emit('users_list', usersList);
    this.server.emit('user_conected', {
      username: username,
      clientId: client.id,
    });
  }

  async handleDisconnect(client: Socket) {
    const username = client.handshake.query.username as string;
    await this.chatService.deleteUser(client.id);
    this.server.emit('user_disconected', {
      username: username,
      clientId: client.id,
    });
  }

  @SubscribeMessage('send_message')
  async handleMessage(client: Socket, payload: { text: string }) {
    const username = client.handshake.query.username as string;
    const createMessageDto: CreateMessageDto = {
      clientId: client.id,
      username: username,
      text: payload.text,
    };
    const message = await this.chatService.saveMessage(createMessageDto);
    this.server.emit('new_message', message);
  }

  @SubscribeMessage('edit_message')
  async handleEditMessage(
    client: Socket,
    payload: { messageId: string; text: string },
  ) {
    const message = await this.chatService.findMessageById(payload.messageId);
    if (!message) {
      return client.emit('error', 'There are no message with such id');
    }
    if (message.clientId !== client.id) {
      return client.emit('error', 'You can only edit yours own messages');
    }
    const updateMessageDto: UpdateMessageDto = {
      messageId: payload.messageId,
      text: payload.text,
    };
    const updatedMessage =
      await this.chatService.updateMessage(updateMessageDto);
    this.server.emit('edited_message', updatedMessage);
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(client: Socket, payload: { messageId: string }) {
    const message = await this.chatService.findMessageById(payload.messageId);
    if (!message) {
      return client.emit('error', 'There are no message with such id');
    }
    if (message.clientId !== client.id) {
      return client.emit('error', 'You can only delete yours own messages');
    }
    const deletedMessage = await this.chatService.deleteMessage(
      payload.messageId,
    );
    this.server.emit('deleted_message', deletedMessage);
  }
}
