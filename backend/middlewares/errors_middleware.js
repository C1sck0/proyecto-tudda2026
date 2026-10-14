export default function errorMiddleware(err, req, res, next) {
    res.json({ error: err.message });
} 
