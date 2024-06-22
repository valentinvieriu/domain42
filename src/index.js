addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);

    if (url.pathname === '/') {
        return getMainPage();
    } else {
        return new Response('404 Not Found', { status: 404 });
    }
}

function html(strings, ...values) {
    return strings.reduce((result, string, i) => {
        return result + string + (values[i] || '');
    }, '');
}

async function getMainPage() {
    const htmlContent = html`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Domain Availability Checker</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        'button-bg': '#6c5ce7',
                        'button-hover-bg': '#5b4cdb',
                        'error-color': '#e74c3c',
                        'available-color': '#2ecc71',
                        'checking-color': '#f39c12',
                    },
                },
            },
        }
    </script>
    <style>
        @keyframes gradientAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .gradient-bg {
            background: linear-gradient(-45deg, #ffcfdf, #e0f0ff, #d5fcf3, #ffe8d1);
            background-size: 400% 400%;
            animation: gradientAnimation 15s ease infinite;
        }
    </style>
</head>
<body class="gradient-bg min-h-screen flex justify-center items-center overflow-x-hidden">
    <div class="container bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-90 rounded-lg p-8 shadow-lg max-w-2xl w-11/12 m-5">
        <h1 class="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">Advanced Domain Availability Checker</h1>
        <form id="domain-form" class="space-y-4">
            <div class="flex items-center space-x-2">
                <div class="relative flex-grow">
                    <input type="text" id="domain" name="domain" required placeholder="Enter domain name (without TLD)" class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-button-bg">
                    <button type="button" id="reset" title="Clear" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hidden">✕</button>
                </div>
                <button type="submit" class="bg-button-bg hover:bg-button-hover-bg text-white font-bold py-2 px-4 rounded transition duration-300">Check</button>
            </div>
            
            <div class="bg-white bg-opacity-50 dark:bg-gray-700 dark:bg-opacity-50 rounded-md p-4 space-y-2">
                <div>
                    <label class="inline-flex items-center">
                        <input type="checkbox" id="popular-tlds" checked class="form-checkbox text-button-bg">
                        <span class="ml-2 text-gray-700 dark:text-gray-300">Popular TLDs</span>
                    </label>
                </div>
                <div>
                    <label class="inline-flex items-center">
                        <input type="checkbox" id="country-tlds" class="form-checkbox text-button-bg">
                        <span class="ml-2 text-gray-700 dark:text-gray-300">Country TLDs</span>
                    </label>
                </div>
                <div>
                    <label class="inline-flex items-center">
                        <input type="checkbox" id="custom-tlds" class="form-checkbox text-button-bg">
                        <span class="ml-2 text-gray-700 dark:text-gray-300">Custom Modern TLDs</span>
                    </label>
                </div>
            </div>
        </form>
        <div id="result" class="mt-6"></div>
    </div>

    <script>
        // JavaScript remains the same as in the original version
        const popularTLDs = [".com", ".org", ".net", ".info", ".co", ".io", ".app", ".dev", ".ai", ".me", ".tv", ".online", ".store", ".website", ".blog", ".tech", ".site", ".xyz"];
        const countryTLDs = [".de", ".cn", ".uk", ".nl", ".ru", ".eu", ".br", ".au", ".it", ".pl", ".jp", ".fr", ".in", ".us", ".ca", ".ch", ".es", ".se", ".no", ".fi", ".be", ".at", ".dk", ".gr", ".tr", ".mx", ".kr", ".hk", ".ie", ".pt", ".cz", ".sg", ".tw", ".hu", ".sk", ".cl", ".il", ".nz", ".th", ".za", ".my", ".ar", ".id", ".ro", ".lt", ".bg", ".si", ".hr", ".ee", ".lv", ".rs", ".ua", ".by", ".lu", ".is", ".mt", ".cy", ".kz", ".ph", ".vn", ".eg", ".ma", ".pk", ".lk", ".ke", ".bd", ".tn", ".gh", ".ng", ".ae", ".sa", ".qa", ".om", ".kw", ".bh", ".jo", ".lb", ".sy", ".am", ".ge", ".az", ".uz", ".mn", ".bt", ".np", ".af", ".kh", ".la", ".mm", ".kg", ".tj", ".tm", ".ir", ".iq", ".dz", ".ly", ".ye", ".sd", ".ao", ".zm", ".zw", ".mz", ".bw", ".na", ".mg"];
        const customTLDs = [".fun", ".ninja", ".beer", ".pizza", ".cool", ".club", ".design", ".fashion", ".fitness", ".guru", ".photography", ".shop", ".studio", ".today", ".world", ".zone", ".life", ".live", ".rocks", ".social", ".academy", ".accountant", ".accountants", ".actor", ".agency", ".airforce", ".apartments", ".art", ".attorney", ".auction", ".audio", ".band", ".bargains", ".best", ".bid", ".bike", ".bingo", ".bio", ".boutique", ".builders", ".business", ".cab", ".cafe", ".camera", ".camp", ".capital", ".cards", ".care", ".cash", ".casino", ".catering", ".center", ".ceo", ".chat", ".cheap", ".church", ".city", ".claims", ".cleaning", ".clinic", ".clothing", ".coach", ".codes", ".coffee", ".community", ".company", ".computer", ".condos", ".construction", ".consulting", ".contractors", ".cooking", ".cool", ".coupons", ".credit", ".creditcard", ".cruise", ".dental", ".diamonds", ".digital", ".direct", ".directory", ".discount", ".doctor", ".dog", ".domains", ".education", ".email", ".engineer", ".engineering", ".equipment", ".estate", ".events", ".exchange", ".expert", ".exposed", ".express", ".fail", ".farm", ".finance", ".financial", ".fish", ".fitness", ".flights", ".florist", ".flowers", ".football", ".forsale", ".foundation", ".fund", ".furniture", ".fyi", ".gallery", ".gifts", ".glass", ".global", ".gmbh", ".gold", ".golf", ".graphics", ".gratis", ".green", ".guide", ".guitars", ".guru", ".health", ".healthcare", ".help", ".hockey", ".holdings", ".holiday", ".house", ".immobilien", ".industries", ".institute", ".insure", ".international", ".investments", ".jewelry", ".kaufen", ".kitchen", ".land", ".law", ".lawyer", ".lease", ".legal", ".lgbt", ".life", ".lighting", ".limited", ".limo", ".loan", ".loans", ".ltd", ".maison", ".management", ".market", ".marketing", ".mba", ".media", ".memorial", ".money", ".mortgage", ".motorcycles", ".movie", ".navy", ".network", ".news", ".ninja", ".partners", ".parts", ".photography", ".photos", ".pictures", ".pizza", ".place", ".plumbing", ".plus", ".productions", ".prof", ".properties", ".property", ".protection", ".pub", ".recipes", ".red", ".rehab", ".rent", ".rentals", ".repair", ".report", ".republican", ".restaurant", ".reviews", ".rich", ".rip", ".rocks", ".run", ".sale", ".salon", ".sarl", ".school", ".schule", ".science", ".services", ".shoes", ".shop", ".shopping", ".show", ".singles", ".soccer", ".social", ".software", ".solar", ".solutions", ".space", ".sport", ".store", ".studio", ".style", ".sucks", ".supplies", ".supply", ".support", ".surf", ".surgery", ".systems", ".tax", ".taxi", ".team", ".tech", ".technology", ".tennis", ".theater", ".theatre", ".tickets", ".tips", ".tires", ".today", ".tools", ".tours", ".town", ".toys", ".trade", ".training", ".travel", ".university", ".vacations", ".ventures", ".vet", ".video", ".villas", ".vin", ".vision", ".voyage", ".watch", ".wine", ".work", ".works", ".world", ".wtf", ".zone"];

        const domainInput = document.getElementById('domain');
        const resetButton = document.getElementById('reset');

        function setTheme() {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setTheme);
        setTheme();

        domainInput.addEventListener('input', function() {
            resetButton.style.display = this.value ? 'inline-block' : 'none';
        });

        resetButton.addEventListener('click', function() {
            domainInput.value = '';
            this.style.display = 'none';
            document.getElementById('result').innerHTML = '';
        });

        document.getElementById('domain-form').addEventListener('submit', function(event) {
            event.preventDefault();
            const domainName = domainInput.value.toLowerCase();
            const resultElement = document.getElementById('result');
            resultElement.innerHTML = '';

            const selectedTLDs = [];
            if (document.getElementById('popular-tlds').checked) selectedTLDs.push(...popularTLDs);
            if (document.getElementById('country-tlds').checked) selectedTLDs.push(...countryTLDs);
            if (document.getElementById('custom-tlds').checked) selectedTLDs.push(...customTLDs);

            selectedTLDs.forEach(tld => {
                const fullDomain = domainName + tld;
                const domainResult = createDomainResultElement(fullDomain);
                resultElement.appendChild(domainResult);
                checkDomainAvailability(fullDomain).then(updateDomainResultElement);
            });
        });

        function createDomainResultElement(domain) {
            const domainResult = document.createElement('div');
            domainResult.className = 'flex items-center justify-between p-2 mb-2 bg-white dark:bg-gray-700 rounded-md';
            domainResult.id = \`result-\${domain}\`;

            const domainName = document.createElement('a');
            domainName.className = 'text-gray-800 dark:text-gray-200 hover:underline';
            domainName.textContent = domain;
            domainName.href = '#';
            domainName.target = '_blank';
            domainName.rel = 'noopener noreferrer';

            const statusIcon = document.createElement('span');
            statusIcon.className = 'text-checking-color';
            statusIcon.textContent = '⏳';
            statusIcon.title = 'Checking...';

            domainResult.appendChild(domainName);
            domainResult.appendChild(statusIcon);
            return domainResult;
        }

        async function checkDomainAvailability(domain) {
            const url = 'https://cloudflare-dns.com/dns-query';
            const params = new URLSearchParams({
                name: domain,
                type: 'A'
            });

            try {
                const response = await fetch(\`\${url}?\${params}\`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/dns-json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                return {
                    domain: domain,
                    available: data.Answer === undefined
                };
            } catch (error) {
                console.error(\`Error checking \${domain}:\`, error);
                return {
                    domain: domain,
                    available: false,
                    error: true
                };
            }
        }

        function updateDomainResultElement(result) {
            const domainResult = document.getElementById(\`result-\${result.domain}\`);
            if (!domainResult) return;

            const domainName = domainResult.querySelector('a');
            const statusIcon = domainResult.querySelector('span');

            if (result.error) {
                statusIcon.textContent = '❓';
                statusIcon.className = 'text-gray-500 dark:text-gray-400';
                statusIcon.title = 'Error checking domain';
                domainName.href = '#';
            } else if (result.available) {
                statusIcon.textContent = '✅';
                statusIcon.className = 'text-available-color';
                statusIcon.title = 'Available';
                domainName.href = \`https://www.namecheap.com/domains/registration/results/?domain=\${result.domain}\`;
            } else {
                statusIcon.textContent = '❌';
                statusIcon.className = 'text-error-color';
                statusIcon.title = 'Unavailable';
                domainName.href = \`http://\${result.domain}\`;
            }
        }
    </script>
</body>
</html>
    `;
  
    return new Response(htmlContent, {
        headers: { 'Content-Type': 'text/html' },
    });
}
