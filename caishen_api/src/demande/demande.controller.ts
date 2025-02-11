import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, Res, HttpStatus } from '@nestjs/common';
import {Response} from 'express'
import { DemandeService } from './demande.service';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';
import { ERole } from 'src/auth/schemas/ERole.enum';
import { Roles } from 'src/auth/Role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/role/role.guard';
import { DocumentDemande } from './schemas/document_demande.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { createDocDTO } from './dto/createdoc.dto';
import { ObjectId } from 'mongoose';

@Controller('api/demande')
export class DemandeController {
  constructor(private readonly demandeService: DemandeService) {}

  @Post()
  @Roles(ERole.Client)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard())
  create(@Body() createDemandeDto: CreateDemandeDto, @Req() req): Promise<string[]> {
    return this.demandeService.create(createDemandeDto, req.user);
  }

  @Get()
  @Roles(ERole.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard())
  findAll() {
    return this.demandeService.getAllDemandes();
  }
  @Post('/client')
  @UseGuards(AuthGuard())
  findByClient(@Body() id) {
    return this.demandeService.getDemandesByclient(id);
  }

  @Post('/dem')
  @UseGuards(AuthGuard())
  findOneById(@Body() id) {
    return this.demandeService.getDemandeById(id);
  }

  @Patch('/action/valide/:id')
  @Roles(ERole.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard())
  valide(@Param() id){
    this.demandeService.valide(id);
  }

  @Patch('/action/refuse/:id')
  @Roles(ERole.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard())
  refuse(@Param() id){
    this.demandeService.refuse(id);
  }

 /*  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDemandeDto: UpdateDemandeDto) {
    return this.demandeService.update(+id, updateDemandeDto);
  } */

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.demandeService.remove(+id);
  }

  /* @Post('/file/:title')
  // You're not actually providing a file, but the interceptor will expect "form data" 
  // (at least in a high level, that's how I think this interceptor works)
  @UseInterceptors(FileInterceptor('file'))
  login(@Body() body) {
      console.log(body);
  } */

  @Post('/file/:title')
  @Roles(ERole.Client)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  handleUpload(@UploadedFile() file: Express.Multer.File, @Req() req, @Param('title') title) {
    console.log(req.files);
    console.log('file', file);
    this.demandeService.handleUpload(title, file, req.user)
    return 'File upload API';
  }

  @Get('/getdocs/:id')
  async getPdfinv(@Res() res: Response, @Param('id') id ) {
    console.log(id)
    const docs = await this.demandeService.getDocs(id);
    
  
    /* res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=simulation.pdf'); */
    return res.status(HttpStatus.OK).send(docs);
  }

  @Post('/doc')
  adddoc(@Body() doc: createDocDTO ){
    this.demandeService.adddoc(doc)
  }

  @Get('/eng')
  findAlleng() {
    return this.demandeService.getAllEngagements();
  }
}
