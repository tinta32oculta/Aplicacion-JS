const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Task = require('../models/task');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Operaciones con tareas
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Obtiene todas las tareas
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de completado
 *     responses:
 *       200:
 *         description: Lista de tareas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/', async (req, res) => {
  try {
    const { completed, q } = req.query;
    const where = {};
    
    // Filtro por estado completado
    if (completed !== undefined) {
      where.completed = completed === 'true';
    }
    
    // Búsqueda por texto (si existe el parámetro q)
    if (q) {
      where.title = {
        [Op.like]: `%${q}%`
      };
    }
    
    const tasks = await Task.findAll({ 
      where,
      order: [['createdAt', 'DESC']] // Ordenar por fecha de creación
    });
    
    res.json(tasks);
  } catch (err) {
    console.error('Error al obtener tareas:', err);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: err.message 
    });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obtiene una tarea por ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Tarea encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Tarea no encontrada
 */
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json(task);
  } catch (err) {
    console.error('Error al obtener tarea:', err);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: err.message 
    });
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Crea una nueva tarea
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskCreate'
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', async (req, res) => {
  try {
    // Validación simple
    if (!req.body.title || typeof req.body.title !== 'string') {
      return res.status(400).json({ error: 'El título es requerido y debe ser texto' });
    }
    
    const taskData = {
      title: req.body.title,
      completed: req.body.completed || false
    };
    
    const task = await Task.create(taskData);
    res.status(201).json(task);
  } catch (err) {
    console.error('Error al crear tarea:', err);
    res.status(400).json({ 
      error: 'Error al crear tarea',
      details: err.message 
    });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     summary: Actualiza una tarea existente
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdate'
 *     responses:
 *       200:
 *         description: Tarea actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Tarea no encontrada
 *       400:
 *         description: Datos de entrada inválidos
 */
router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    // Validar datos de entrada
    if (req.body.title && typeof req.body.title !== 'string') {
      return res.status(400).json({ error: 'El título debe ser texto' });
    }
    
    if (req.body.completed && typeof req.body.completed !== 'boolean') {
      return res.status(400).json({ error: 'El estado completado debe ser booleano' });
    }
    
    // Actualizar solo los campos proporcionados
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.completed !== undefined) updates.completed = req.body.completed;
    
    await task.update(updates);
    res.json(task);
  } catch (err) {
    console.error('Error al actualizar tarea:', err);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: err.message 
    });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Elimina una tarea
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarea a eliminar
 *     responses:
 *       200:
 *         description: Tarea eliminada
 *       404:
 *         description: Tarea no encontrada
 */
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    await task.destroy();
    res.json({ message: 'Tarea eliminada exitosamente' });
  } catch (err) {
    console.error('Error al eliminar tarea:', err);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: err.message 
    });
  }
});

module.exports = router;