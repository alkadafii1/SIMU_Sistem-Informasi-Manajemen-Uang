const rolloverMonth = (req, res, next) => {
  try {
    // TODO: Fase 3 - implementasi rollover
    res.json({
      success: true,
      message: 'Rollover endpoint ready (Fase 3)'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { rolloverMonth };