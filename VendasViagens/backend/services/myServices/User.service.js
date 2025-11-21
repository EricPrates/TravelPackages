import db from '../../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';const Users = db.Users;
const TravelPackage = db.TravelPackage;

export const findOne = async (req, res) => {
    const id = req.params.id;
    try{
        const data = await Users.findByPk(id, {
            include: [{
                model: TravelPackage, as: 'bookedPackages',
                attributes: ['id', 'title', 'description', 'price', 'duration', 'destination', 'availableSlots', 'image'],
                through: { attributes: [] },
            }]
        });
        res.send(data);
    }catch(error){
        res.status(500).send({
            message: error.message || "Erro ao buscar usuário com id=" + id
        });
    }
};
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'agent' } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email e password obrigatórios' });
    const exists = await Users.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Usuário já existe' });
    const hash = await bcrypt.hash(password, 10);
    const user = await Users.create({ name, email, password: hash, role });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_PRIVATE_KEY, { expiresIn: '8h' }, { algorithms: ['HS256'] });
    return res.status(201).json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'erro ao criar usuário' });
  }
};

export const findAll = async (req, res) => {
    try{
             
        const data = await Users.findAll({
            include: [{
                model: TravelPackage, as: 'bookedPackages',
                attributes: ['id', 'title', 'description', 'duration', 'destination', 'availableSlots', 'image', ],
            }],
            attributes: ['id', 'name', 'email', 'role', 'cash', 'miles'],
        })
        res.send(data)
    }catch(error){
        res.status(500).send({
            message: error.message || "Erro ao buscar usuários"
        })
    }


};
export const findOneByName = async (req, res) => {
  let name;
    try{
        name = req.query.name;
        if(!name){
            res.status(400).send({
                message: "O nome é obrigatório."
            });
            return;
        }
        const nameClean = name.trim();
        const data = await Users.findAll({
            where: {
                name: {
                    [Op.like]: `%${nameClean}%`
                }
            },
            include: [{
                model: TravelPackage, as: 'bookedPackages',
                attributes: ['id', 'title', 'description', 'price', 'duration', 'destination', 'availableSlots', 'image', 'totalPrice'],
                through: { attributes: [] },
            }
            ]
        })
        if(data.length > 0){
         return   res.status(200).send(data)
        }else{
          return  res.status(404).send({
                message: `Não foi possível encontrar o usuário com nome=${nameClean}.`
            })
        }
    }catch(error){
        res.status(500).send({
            message: "Erro ao buscar usuário com nome=" + name
        })
    }
}

export const create = async (req, res) => {
    if(!req.body.name){
        res.status(400).send({
            message: "O campo nome é obrigatório."
        });
        return;
    }
    
    try {
        const user = await Users.create(req.body);
      return  res.status(201).send(user);
    } catch (error) {
        return res.status(500).send({
            message: "Erro ao criar usuário."
        });
    }
};
export const update = async (req, res) => {
    const id = req.params.id;
    try{
        const [updated] = await Users.update (req.body, {
            where: {id: id}
        });
        if(updated > 0){
            const updatedUser = await Users.findByPk(id);
            res.status(200).send({
                message: "Usuário atualizado com sucesso.",
                data: updatedUser
            });
        }else{
            res.status(404).send({
                message: `Não foi possível encontrar o usuário com id=${id}.`
            });
        }
    }catch(error){
        res.status(500).send({
            message: "Erro ao atualizar usuário com id=" + id
        });
    }
};
export const remove = async (req, res) => {
    const id = req.params.id;

    try{
        const deleted = await Users.destroy({
            where: {id: id}
        });
        if(deleted > 0){
            res.status(200).send({
                message: "Usuário removido com sucesso."
            });
        }else{
            res.status(404).send({
                message: `Não foi possível encontrar o usuário com id=${id}.`
            });
        }
    }catch(error){
        res.status(500).send({
            message: "Erro ao remover usuário com id=" + id
        });
    }



};