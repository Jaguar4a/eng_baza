const express = require('express');
const fs = require('fs').promises;
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// JSON faylini o'qish
const readJSON = async () => {
    try {
        const data = await fs.readFile('natijalar.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('JSON faylni o\'qishda xatolik:', error);
        throw error;
    }
};

// JSON faylini yozish
const writeJSON = async (data) => {
    try {
        await fs.writeFile('natijalar.json', JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('JSON faylni yozishda xatolik:', error);
        throw error;
    }
};

// Kategoriyalarni belgilash
const wordTypes = [
    "Tanlanmagan",
    "noun",
    "adjective",
    "adverb",
    "verb",
    "number",
    "pronoun",
    "preposition",
    "interjection",
    "conjunction",
    "article"];
const grammaticalCategories = [
    "countable",
    "uncountable",
    "singular",
    "plural",
    "positive_degree",
    "comparative_degree",
    "superlative_degree",
    "present_tense",
    "past_tense",
    "future_tense",
    "future_in_the_past_tense",
    "possessive_pronoun",
    "personal_pronoun",
    "relative_pronoun",
    "reflexive_pronoun",
    "indefinite_pronoun",
    "demonstrative_pronoun",
    "interrogative_pronoun",
    "intensive_pronoun",
    "reciprocal_pronoun",
    "coordinating_conjunction",
    "subordinate_conjunction",
    "correlating_conjunction",
    "definite_article",
    "indefinite_article",
    "common_noun",
    "proper_noun",
    "transitive",
    "intransitive",
    "participle_i",
    "gerund",
    "infinitive",
    "mood",
    "conditional",
    "active_voice",
    "passive_voice"];

// HTML sahifani yaratish
const generateHTML = (data) => {
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>So'zlar Ro'yxati</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 100%;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            h1 {
                text-align: center;
                color: #2c3e50;
                margin-bottom: 30px;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                background-color: #fff;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            }
            th, td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }
            th {
                background-color: #3498db;
                color: #fff;
                font-weight: bold;
            }
            tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            tr:hover {
                background-color: #e6e6e6;
            }
            .checkbox-group {
                display: flex;
                flex-wrap: wrap;
            }
            .checkbox-group label {
                margin-right: 10px;
                display: flex;
                align-items: center;
                cursor: pointer;
            }
            .checkbox-group input[type="checkbox"] {
                margin-right: 5px;
            }
            select {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background-color: #fff;
            }
            select:focus {
                outline: none;
                border-color: #3498db;
            }
            #loadingIndicator {
                text-align: center;
                padding: 20px;
                font-style: italic;
                color: #666;
            }
            #searchContainer {
                margin-bottom: 20px;
                display: flex;
                justify-content: center;
            }
            #searchInput {
                padding: 10px;
                font-size: 16px;
                border: 1px solid #ddd;
                border-radius: 4px;
                width: 200px;
            }
            #searchButton {
                padding: 10px 20px;
                font-size: 16px;
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                margin-left: 10px;
            }
            #searchButton:hover {
                background-color: #2980b9;
            }
        </style>
    </head>
    <body>
        <h1>So'zlar Ro'yxati</h1>
        <div id="searchContainer">
            <input type="number" id="searchInput" placeholder="Tartib raqamini kiriting">
            <button id="searchButton">Qidirish</button>
        </div>
        <table id="wordTable">
            <thead>
                <tr>
                    <th>№</th>
                    <th>So'z</th>
                    <th>Soni</th>
                    <th style="width: 125px;">So'z turi</th>
                    <th>Grammatik kategoriya</th>
                </tr>
            </thead>
            <tbody id="wordTableBody">
                <!-- Data will be loaded here -->
            </tbody>
        </table>
        <div id="loadingIndicator" style="display: none;">Yuklanmoqda...</div>

        <script>
        const allData = ${JSON.stringify(data)};
        const wordTypes = ${JSON.stringify(wordTypes)};
        const grammaticalCategories = ${JSON.stringify(grammaticalCategories)};
        let currentIndex = 0;
        const ITEMS_PER_LOAD = 20;

        function loadMoreItems(startIndex = currentIndex) {
            const tbody = document.getElementById('wordTableBody');
            const endIndex = Math.min(startIndex + ITEMS_PER_LOAD, allData.length);
            
            for (let i = startIndex; i < endIndex; i++) {
                const item = allData[i];
                const row = document.createElement('tr');
                row.innerHTML = createRowHTML(item, i);
                tbody.appendChild(row);
            }
            currentIndex = endIndex;
            document.getElementById('loadingIndicator').style.display = 'none';
        }

        function createRowHTML(item, index) {
            return \`
                <td>\${index + 1}</td>
                <td styl="font-size: 24px;font-weight: bold;">\${item.word}</td>
                <td>\${item.count}</td>
                <td>
                    <select onchange="updateCategory(\${index}, 'wordType', this.value)">
                        \${wordTypes.map(type => \`<option value="\${type}" \${type === item.wordType ? 'selected' : ''}>\${type}</option>\`).join('')}
                    </select>
                </td>
                <td>
                    <div class="checkbox-group">
                        \${grammaticalCategories.map(category => \`
                            <label>
                                <input type="checkbox" 
                                       onchange="updateGrammaticalCategory(\${index}, '\${category}', this.checked)"
                                       \${item.grammaticalCategory && item.grammaticalCategory.includes(category) ? 'checked' : ''}>
                                \${category}
                            </label>
                        \`).join('')}
                    </div>
                </td>
            \`;
        }

        function checkIfBottomReached() {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
                if (currentIndex < allData.length) {
                    document.getElementById('loadingIndicator').style.display = 'block';
                    setTimeout(loadMoreItems, 500); // Add a small delay for better UX
                }
            }
        }

        function searchByIndex() {
            const searchInput = document.getElementById('searchInput');
            const searchIndex = parseInt(searchInput.value) - 1; // Indexlar 0 dan boshlanadi
            
            if (isNaN(searchIndex) || searchIndex < 0 || searchIndex >= allData.length) {
                alert("Noto'g'ri tartib raqami kiritildi!");
                return;
            }
            
            document.getElementById('wordTableBody').innerHTML = ''; // Jadval tarkibini tozalash
            currentIndex = searchIndex;
            loadMoreItems(searchIndex);
        }

        window.addEventListener('scroll', checkIfBottomReached);
        window.addEventListener('resize', checkIfBottomReached);
        document.getElementById('searchButton').addEventListener('click', searchByIndex);

        // Initial load
        loadMoreItems();

        function updateCategory(index, field, value) {
            sendUpdate(index, field, value);
        }

        function updateGrammaticalCategory(index, category, isChecked) {
            fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ index, field: 'grammaticalCategory', category, isChecked }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Muvaffaqiyatli yangilandi');
                } else {
                    console.error('Xatolik yuz berdi');
                }
            })
            .catch((error) => {
                console.error('Xatolik:', error);
            });
        }

        function sendUpdate(index, field, value) {
            fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ index, field, value }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Muvaffaqiyatli yangilandi');
                } else {
                    console.error('Xatolik yuz berdi');
                }
            })
            .catch((error) => {
                console.error('Xatolik:', error);
            });
        }
        </script>
    </body>
    </html>
    `;

    return html;
};

// Asosiy route
app.get('/', async (req, res) => {
    try {
        const data = await readJSON();
        const html = generateHTML(data);
        res.send(html);
    } catch (error) {
        res.status(500).send('Serverda xatolik yuz berdi');
    }
});

// Kategoriyani yangilash uchun POST so'rovi
app.post('/', async (req, res) => {
    try {
        const { index, field, value, category, isChecked } = req.body;
        const data = await readJSON();
        
        if (field === 'grammaticalCategory') {
            if (!Array.isArray(data[index][field])) {
                data[index][field] = [];
            }
            if (isChecked) {
                if (!data[index][field].includes(category)) {
                    data[index][field].push(category);
                }
            } else {
                data[index][field] = data[index][field].filter(item => item !== category);
            }
        } else {
            data[index][field] = value;
        }
        
        await writeJSON(data);
        res.json({ success: true });
    } catch (error) {
        console.error('Yangilashda xatolik:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server http://localhost:${port} portida ishga tushdi`);
});