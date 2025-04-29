const express = require("express");
const app = express();
const path = require("path");
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT;

// Initialize Supabase
const supabase = createClient(process.env.SUPABASEURL, process.env.SUPABASEKEY);

// Home route
app.get('/', (req, res) => {
    res.render('home');
});



app.get('/fetch_percentile/:marks/:date/:shift', async (req, res) => {
    const { marks, date, shift } = req.params;
    const [year, month, day] = date.split("-");
    const formatDate = `${day}-${month}-${year}`;
    const newShift = `Shift_${shift}`;

    try {
        // Step 1: Get difficulty level
        const { data, error } = await supabase
            .from('difficulty_of_exam')
            .select(`${newShift}`)
            .eq('Date', formatDate)
            .maybeSingle();

        if (error || !data) {
            return res.status(500).json({ error: 'Failed to fetch difficulty' });
        }

        const difficulty = data[newShift];
        // Validate difficulty is a safe column name
        const allowedColumns = ['Easy', 'Medium', 'Hard'];
        if (!allowedColumns.includes(difficulty)) {
            return res.status(400).json({ error: 'Invalid difficulty level' });
        }

        // Step 2: Fetch all rows with Percentile + difficulty column
        const { data: rows, error: queryError } = await supabase
            .from('marks_vs_percentile')
            .select(`Percentile, "${difficulty}"`);

        if (queryError) throw queryError;

        // Step 3: Filter upper and lower in JS
        const upper = rows
            .filter(r => r[difficulty] >= Number(marks))
            .sort((a, b) => a[difficulty] - b[difficulty])[0];

        const lower = rows
            .filter(r => r[difficulty] < Number(marks))
            .sort((a, b) => b[difficulty] - a[difficulty])[0];

        // console.log("upper:", upper);
        // console.log("lower:", lower);

        // Step 4: Return response
        let Percentile = 0;

        if (!upper && lower) {
            Percentile = lower.Percentile;
        } else if (upper && !lower) {
            Percentile = 0;
        } else if (upper && lower) {
            Percentile = ((marks - lower[difficulty]) / (upper[difficulty] - lower[difficulty])) + lower.Percentile;
        }

        return res.status(200).json({ Percentile });

    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ error: 'Unexpected server error' });
    }
});

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});

