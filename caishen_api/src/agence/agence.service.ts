import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose,  { Model } from 'mongoose';
import { IMF } from 'src/imf/schemas/imf.schema';
import { Agence } from './schemas/agence.schema';
import { AgenceDto } from './dto/agence.dto';

@Injectable()
export class AgenceService {
    constructor(
        @InjectModel(IMF.name) private IMFModel: Model<IMF>,
        @InjectModel(Agence.name) private AgenceModel: Model<Agence>,
    ){ }

        async newAgence(nom_imf: string, agencedto: AgenceDto): Promise<Agence>{
            const imf = await this.IMFModel.findOne({nom: nom_imf});
            if (imf) {
              const data = Object.assign({ imf: imf._id, nom_imf:nom_imf }, agencedto);
            const created_agence = new this.AgenceModel(data);
            return created_agence.save();
            }
            throw new NotFoundException("imf non trouvée")
            
        }

        async updateagence(id, agencedto: AgenceDto ): Promise<Agence> {
          const updatedagence = await this.AgenceModel.findByIdAndUpdate(id, agencedto, {
              new: true,
              runValidators: true,
            });
            return updatedagence.save();
          }

          async deleteagence(idagence): Promise<Agence>{
            return (await this.AgenceModel.findByIdAndDelete(idagence));
          }

          async getAllAgencies(nom_imf: string): Promise<Agence[]>{
            return await this.AgenceModel.find({nom_imf: nom_imf}).exec();
          }

          async getAgenceById(id): Promise<Agence>{
            return await this.AgenceModel.findOne({_id: new mongoose.Types.ObjectId(id)}).exec();
          }
}
