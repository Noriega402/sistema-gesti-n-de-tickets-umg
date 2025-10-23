export function validateTicket(req, res, next) {
  const { email, nombre, asunto, descripcion } = req.body;

  if (!email || !nombre || !asunto || !descripcion) {
    return res.status(400).json({
      ok: false,
      error: 'Faltan campos obligatorios: email, nombre, asunto, descripcion.'
    });
  }
  next();
};

export default validateTicket;