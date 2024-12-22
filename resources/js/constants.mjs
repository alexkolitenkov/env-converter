export const prefixes = {
    'Default': '',
    'React App': 'REACT_APP',
    'Next.js': 'NEXT_PUBLIC'
};

export const services = {
    'None': '',
    'Firebase': 'FIREBASE',
    'Open AI': 'OPENAI',
    'Facebook': 'FACEBOOK'
};

export const inputOptions = {
    defaultPath: 'file.json',
    filters: [
        { name: 'JSON object', extensions: ['json'] },
        { name: 'JavaScript object', extensions: ['js'] },
    ]
};

export const outputOptions = {
    defaultPath: '.env',
    filters: [
        { name: '.env file', extensions: ['.env'] }
    ]
};