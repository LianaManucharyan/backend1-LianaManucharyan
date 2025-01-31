import { Router } from "express";
import { userModel } from "../../models/users.model.js";

const router = Router()

router.get('/', async (req, res) => {
    try {
        const usersDb = await userModel.find({})
        res.send({
            status: 'success',
            payload: usersDb
        })
    }catch(error){
        console.log(error)
    }
    
})

router.post('/', async (req, res) => {
    try {
        const { first_name, last_name, email } = req.body;

        if (!first_name || !last_name || !email) {
            return res.status(400).json({ status: 'error', message: 'Todos los campos son requeridos' });
        }

        const newUser = new userModel({
            first_name,
            last_name,
            email,
        });

        const result = await newUser.save();

        res.status(201).json({ status: 'success', payload: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Hubo un problema al crear el usuario', error });
    }
});

router.get('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;

        const user = await userModel.findById(uid);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado',
            });
        }
        res.status(200).json({
            status: 'success',
            payload: user,
        });

    } catch (error) {
        console.error('Error al obtener el usuario:', error);
    }
});

router.put('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const { first_name, last_name, email } = req.body; 

        if (!first_name || !last_name || !email) {
            return res.status(400).json({
                status: 'error',
                message: 'Todos los campos son requeridos para actualizar el usuario.',
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            { _id: uid },
            { first_name, last_name, email },  
            { new: true }  
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado.',
            });
        }

        res.status(200).json({
            status: 'success',
            payload: updatedUser,
        });

    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({
            status: 'error',
            message: 'Hubo un problema al actualizar el usuario.',
            error: error.message,
        });
    }
});

router.delete('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;

        const deletedUser = await userModel.findByIdAndDelete(uid);

        if (!deletedUser) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado.',
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Usuario eliminado exitosamente.',
            payload: deletedUser,
        });

    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
    }
});




export default router;