import app from './src/app.js'
import deleteExpiredAccounts from './src/jobs/deleteExpiredAccounts.js'
import { connectDb } from './src/config/db.js'

connectDb()
deleteExpiredAccounts()

const PORT = process.env.PORT || 3000 

app.get('/', (req, res) => {
    res.status(200).send('Server started')
})

app.listen(PORT, () => {
    console.log(`Server is running at http:localhost:${PORT}`);
    
})