export default (err, req, res, next) => {
    console.error("Error:", err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
  };
  