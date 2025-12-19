import { Controller, Post, Body, UseInterceptors, UploadedFile, Get, Param, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('auth') 
  login(@Body('email') email: string) {
    return this.appService.login(email);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File, @Body('userId') userId: string) {
    return this.appService.uploadAndProcess(file, userId);
  }

  @Get('documents') 
  list(@Query('userId') userId: string) {
    return this.appService.getDocuments(userId);
  }

  @Post('chat') 
  chat(@Body() body: { documentId: string; question: string }) {
    return this.appService.askLLM(body.documentId, body.question);
  }
}