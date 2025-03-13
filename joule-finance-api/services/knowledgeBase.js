// Joule Finance Knowledge Base
const fs = require('fs');
const path = require('path');

class KnowledgeBase {
  constructor() {
    this.knowledge = {};
    this.knowledgeDir = path.join(__dirname, '../knowledge');
    
    // Create knowledge directory if it doesn't exist
    if (!fs.existsSync(this.knowledgeDir)) {
      fs.mkdirSync(this.knowledgeDir, { recursive: true });
    }
    
    // Load initial knowledge
    this.loadKnowledge();
  }
  
  loadKnowledge() {
    try {
      // Read all JSON files in knowledge directory
      const files = fs.readdirSync(this.knowledgeDir)
        .filter(file => file.endsWith('.json'));
      
      for (const file of files) {
        const category = file.replace('.json', '');
        const content = fs.readFileSync(path.join(this.knowledgeDir, file), 'utf8');
        this.knowledge[category] = JSON.parse(content);
        console.log(`Loaded knowledge: ${category}`);
      }
      
      console.log(`Loaded ${Object.keys(this.knowledge).length} knowledge categories`);
      
      // Generate initial files if none exist
      if (Object.keys(this.knowledge).length === 0) {
        this.generateInitialKnowledge();
      }
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    }
  }
  
  generateInitialKnowledge() {
    // Create initial knowledge files
    const initialData = {
      'protocol': {
        name: 'Joule Finance',
        description: 'A DeFi protocol built on the Aptos blockchain focused on lending, borrowing, and liquidity provision',
        launchDate: '2023-03-15',
        founder: 'Joule Labs',
        website: 'https://joule.finance',
        github: 'https://github.com/joule-finance',
        features: [
          'Lending and borrowing with competitive rates',
          'Liquidity pools with incentivized staking',
          'Cross-chain bridges for multi-chain support',
          'Yield farming opportunities',
          'Governance through JOULE token'
        ],
        uniqueSellingPoints: [
          'Built natively on Aptos for maximum efficiency',
          'Advanced risk management system',
          'Higher yields than competitors',
          'Innovative flash loan protocol',
          'Community-driven governance'
        ]
      },
      'tokens': [
        {
          symbol: 'USDC',
          name: 'USD Coin',
          description: 'A stablecoin pegged to the US Dollar',
          contractAddress: '0x1::aptos_coin::AptosCoin',
          decimals: 6,
          isStablecoin: true
        },
        {
          symbol: 'USDT',
          name: 'Tether',
          description: 'A stablecoin pegged to the US Dollar',
          contractAddress: '0x2::tether::TetherCoin',
          decimals: 6,
          isStablecoin: true
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          description: 'Wrapped Ethereum on Aptos',
          contractAddress: '0x3::weth::WrappedEthereum',
          decimals: 18,
          isStablecoin: false
        },
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          description: 'Wrapped Bitcoin on Aptos',
          contractAddress: '0x4::wbtc::WrappedBitcoin',
          decimals: 8,
          isStablecoin: false
        },
        {
          symbol: 'APT',
          name: 'Aptos',
          description: 'Native token of the Aptos blockchain',
          contractAddress: '0x1::aptos_coin::AptosCoin',
          decimals: 8,
          isStablecoin: false
        },
        {
          symbol: 'JOULE',
          name: 'Joule',
          description: 'Governance token for the Joule Finance protocol',
          contractAddress: '0x5::joule::JouleToken',
          decimals: 8,
          isStablecoin: false
        }
      ],
      'products': [
        {
          name: 'Lending Protocol',
          description: 'Deposit assets to earn interest or borrow assets by providing collateral',
          features: [
            'Variable and fixed interest rates',
            'Multiple collateral types',
            'Liquidation protection features',
            'Boost yields with JOULE staking'
          ],
          risks: [
            'Smart contract risk',
            'Liquidation risk if collateral value drops',
            'Interest rate fluctuations'
          ]
        },
        {
          name: 'Liquidity Pools',
          description: 'Provide liquidity to earn trading fees and JOULE rewards',
          features: [
            'Concentrated liquidity for better capital efficiency',
            'Multiple fee tiers',
            'Single-sided liquidity provision',
            'Boosted rewards for long-term stakers'
          ],
          risks: [
            'Impermanent loss',
            'Smart contract risk',
            'Market volatility impact'
          ]
        },
        {
          name: 'Staking',
          description: 'Stake JOULE tokens to earn protocol fees and governance rights',
          features: [
            'Tiered staking rewards',
            'Voting power for governance',
            'Early access to new features',
            'Revenue sharing from protocol fees'
          ],
          lockupPeriods: ['14 days', '30 days', '90 days', '180 days'],
          rewards: ['Base APR 8-12%', 'Protocol fee share', 'Voting rights']
        },
        {
          name: 'Cross-Chain Bridge',
          description: 'Move assets between Aptos and other blockchains',
          supportedChains: ['Ethereum', 'BNB Chain', 'Solana', 'Avalanche'],
          features: [
            'Low fees',
            'Fast settlement times',
            'Secure multi-signature verification',
            'No slippage on stablecoin transfers'
          ]
        }
      ],
      'security': {
        audits: [
          {
            auditor: 'CertiK',
            date: '2023-02-01',
            report: 'https://joule.finance/audits/certik-2023.pdf',
            findings: 'No critical issues found. 3 medium issues resolved before launch.'
          },
          {
            auditor: 'Trail of Bits',
            date: '2023-01-15',
            report: 'https://joule.finance/audits/tob-2023.pdf',
            findings: 'No critical issues found. 2 medium issues resolved before launch.'
          }
        ],
        securityFeatures: [
          'Time-locked admin controls',
          'Emergency shutdown capability',
          'Gradual parameter adjustment',
          'Multi-signature governance actions',
          'Bug bounty program up to $1 million'
        ],
        insuranceOptions: 'Users can purchase coverage through Nexus Mutual and InsurAce'
      },
      'governance': {
        token: 'JOULE',
        votingMechanism: 'On-chain voting with snapshot for signaling',
        proposalThreshold: '100,000 JOULE tokens to submit proposals',
        votingPeriod: '5 days',
        timelock: '48 hours after successful vote before implementation',
        executionDelay: '24 hours',
        councilMembers: [
          {
            name: 'Alex Thompson',
            role: 'Lead Developer',
            twitter: '@alexjoulefinance'
          },
          {
            name: 'Sophia Chen',
            role: 'Chief Strategy Officer',
            twitter: '@sophiachen'
          },
          {
            name: 'Marcus Johnson',
            role: 'Community Lead',
            twitter: '@marcusjfinance'
          }
        ]
      },
      'technology': {
        blockchain: 'Aptos',
        languageAndFrameworks: 'Move programming language, Aptos Standard Library',
        keyInnovations: [
          'Parallel transaction execution for high throughput',
          'Advanced risk assessment algorithm',
          'Automated market makers with concentrated liquidity',
          'Cross-chain messaging protocol',
          'MEV protection mechanisms'
        ],
        scalability: 'Can process up to 160,000 transactions per second with sharding',
        securityFeatures: [
          'Formal verification of core contracts',
          'Comprehensive unit and integration testing',
          'Regular third-party audits',
          'Bug bounty program'
        ]
      },
      'faq': [
        {
          question: 'What is Joule Finance?',
          answer: 'Joule Finance is a decentralized finance (DeFi) protocol built on the Aptos blockchain. It offers lending, borrowing, staking, and liquidity provision services with competitive rates.'
        },
        {
          question: 'How do I use Joule Finance?',
          answer: 'You can access Joule Finance through our web app at app.joule.finance. Connect your Aptos wallet (like Petra or Martian) to start using our services.'
        },
        {
          question: 'What are the risks of using Joule Finance?',
          answer: 'Like all DeFi protocols, using Joule Finance involves various risks including smart contract risk, market volatility risk, liquidation risk (for borrowers), and impermanent loss (for liquidity providers).'
        },
        {
          question: 'How are interest rates determined?',
          answer: 'Interest rates are determined algorithmically based on supply and demand in each market. High utilization of a particular asset results in higher borrowing rates, which incentivizes more deposits and fewer loans.'
        },
        {
          question: 'What is the JOULE token used for?',
          answer: 'JOULE is the governance token of the protocol. It allows holders to vote on protocol changes, earn a share of protocol fees, and receive boosted yields on deposits and liquidity provision.'
        },
        {
          question: 'How does liquidation work?',
          answer: 'If a borrower\'s collateral value falls below the required threshold (typically 125-150% of the loan value, depending on the asset), part of their position may be liquidated to repay the loan and maintain protocol solvency.'
        },
        {
          question: 'Is Joule Finance audited?',
          answer: 'Yes, Joule Finance has been audited by leading security firms including CertiK and Trail of Bits. All audit reports are available on our website.'
        }
      ]
    };
    
    // Write each category to a separate file
    for (const [category, data] of Object.entries(initialData)) {
      this.saveKnowledge(category, data);
    }
    
    // Load the knowledge back
    this.loadKnowledge();
  }
  
  saveKnowledge(category, data) {
    try {
      fs.writeFileSync(
        path.join(this.knowledgeDir, `${category}.json`),
        JSON.stringify(data, null, 2),
        'utf8'
      );
      console.log(`Saved knowledge category: ${category}`);
    } catch (error) {
      console.error(`Error saving knowledge category ${category}:`, error);
    }
  }
  
  getKnowledge(category) {
    return this.knowledge[category] || null;
  }
  
  getAllKnowledge() {
    return this.knowledge;
  }
  
  // Search across all knowledge
  search(query) {
    query = query.toLowerCase();
    const results = {};
    
    for (const [category, data] of Object.entries(this.knowledge)) {
      const matches = this.searchInObject(data, query);
      if (matches.length > 0) {
        results[category] = matches;
      }
    }
    
    return results;
  }
  
  // Recursively search in nested objects and arrays
  searchInObject(obj, query, path = '') {
    const matches = [];
    
    if (typeof obj === 'string' && obj.toLowerCase().includes(query)) {
      matches.push({ path, value: obj });
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const newPath = path ? `${path}[${index}]` : `[${index}]`;
        const nestedMatches = this.searchInObject(item, query, newPath);
        matches.push(...nestedMatches);
      });
    } else if (obj && typeof obj === 'object') {
      Object.entries(obj).forEach(([key, value]) => {
        const newPath = path ? `${path}.${key}` : key;
        if (key.toLowerCase().includes(query)) {
          matches.push({ path: newPath, key });
        }
        const nestedMatches = this.searchInObject(value, query, newPath);
        matches.push(...nestedMatches);
      });
    }
    
    return matches;
  }
  
  // Get relevant information for a user query
  getRelevantInfo(query) {
    // Start with direct search
    const searchResults = this.search(query.toLowerCase());
    
    // Extract key information based on the query
    const relevant = {
      protocol: this.getIfRelevant(query, 'protocol', ['description', 'features', 'uniqueSellingPoints']),
      tokens: this.filterRelevantTokens(query),
      products: this.filterRelevantProducts(query),
      rates: null, // Will be filled from real-time data
      faq: this.filterRelevantFAQs(query)
    };
    
    return {
      searchResults,
      relevant
    };
  }
  
  getIfRelevant(query, category, fields) {
    const data = this.getKnowledge(category);
    if (!data) return null;
    
    // Check if this category seems relevant to the query
    const categoryRelevant = 
      category.toLowerCase().includes(query.toLowerCase()) || 
      query.toLowerCase().includes(category.toLowerCase());
      
    if (categoryRelevant) {
      // If relevant, extract just the requested fields
      if (fields && Array.isArray(fields)) {
        const result = {};
        fields.forEach(field => {
          if (data[field]) result[field] = data[field];
        });
        return result;
      }
      return data;
    }
    
    return null;
  }
  
  filterRelevantTokens(query) {
    const tokens = this.getKnowledge('tokens');
    if (!tokens) return null;
    
    const tokenNames = tokens.map(t => t.symbol.toLowerCase());
    const hasTokenName = tokenNames.some(name => 
      query.toLowerCase().includes(name) || 
      name.includes(query.toLowerCase())
    );
    
    if (query.toLowerCase().includes('token') || 
        query.toLowerCase().includes('coin') || 
        query.toLowerCase().includes('asset') ||
        hasTokenName) {
      
      // If looking for a specific token, filter to just that one
      if (hasTokenName) {
        return tokens.filter(token => 
          query.toLowerCase().includes(token.symbol.toLowerCase()) || 
          query.toLowerCase().includes(token.name.toLowerCase())
        );
      }
      
      return tokens;
    }
    
    return null;
  }
  
  filterRelevantProducts(query) {
    const products = this.getKnowledge('products');
    if (!products) return null;
    
    const productTerms = ['product', 'service', 'feature', 'lending', 'borrowing', 'stake', 'staking', 'liquidity', 'pool', 'yield'];
    const isProductQuery = productTerms.some(term => query.toLowerCase().includes(term));
    
    if (isProductQuery) {
      // Filter to specific products if mentioned
      const productNames = products.map(p => p.name.toLowerCase());
      const hasProductName = productNames.some(name => 
        query.toLowerCase().includes(name.toLowerCase())
      );
      
      if (hasProductName) {
        return products.filter(product => 
          query.toLowerCase().includes(product.name.toLowerCase())
        );
      }
      
      return products;
    }
    
    return null;
  }
  
  filterRelevantFAQs(query) {
    const faqs = this.getKnowledge('faq');
    if (!faqs) return null;
    
    // Look for matching FAQs
    return faqs.filter(faq => {
      const q = faq.question.toLowerCase();
      const a = faq.answer.toLowerCase();
      const queryLower = query.toLowerCase();
      
      return q.includes(queryLower) || 
             a.includes(queryLower) ||
             // Check for keyword matches
             queryLower.split(' ').some(word => 
               word.length > 3 && (q.includes(word) || a.includes(word))
             );
    });
  }
  
  // Generate a short system prompt based on most important knowledge
  generateKnowledgePrompt() {
    const protocol = this.getKnowledge('protocol');
    const tokens = this.getKnowledge('tokens');
    const products = this.getKnowledge('products');
    
    let prompt = '';
    
    if (protocol) {
      prompt += `About Joule Finance: ${protocol.description}\n\n`;
      prompt += `Key Features:\n${protocol.features.map(f => `- ${f}`).join('\n')}\n\n`;
    }
    
    if (tokens) {
      prompt += `Supported Assets: ${tokens.map(t => t.symbol).join(', ')}\n\n`;
    }
    
    if (products) {
      prompt += 'Products:\n';
      products.forEach(product => {
        prompt += `- ${product.name}: ${product.description}\n`;
      });
      prompt += '\n';
    }
    
    return prompt;
  }
}

module.exports = new KnowledgeBase(); 