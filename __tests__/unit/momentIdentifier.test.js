const momentIdentifier = require('../../src/momentHandling/momentIdentifier');

describe('Tests to check number is being received and handled correctly', () => {

    test('Test that doesItHaveANumber is returning true, when a number is provided', () => {
        const string = 'Hello, I contain the number 123456';

        expect(momentIdentifier.doesItHaveANumber(string)).toStrictEqual(true);
    });

    test('Test that doesItHaveANumber is returning true, when a number is provided', () => {
        const string = 'Hello, I do not contain the number';

        expect(momentIdentifier.doesItHaveANumber(string)).toStrictEqual(false);
    });
});


describe('Tests to check findTimes is correctly identifying numbers', () => {
    test('Test that findTimes returns a number with the format of 0000, when a single number is provided', () => {
        const string = 'Hello, I contain the number 8000';

        expect(momentIdentifier.findTimes(string)).toStrictEqual(['8000']);
    });

    test('Test that findTimes returns a number with the format of 00:00, when a single number is provided', () => {
        const string = 'Hello, I contain the number 80:00';

        expect(momentIdentifier.findTimes(string)).toStrictEqual(['80:00']);
    });

    test('Test that findTimes is returns multiple numbers, when multiple numbers is provided', () => {
        const string = 'Hello, I contain the number 1000, I also contain 5000';

        expect(momentIdentifier.findTimes(string)).toStrictEqual(['1000', '5000']);

    });

    test('Test that findTimes is returns multiple numbers that match format, when multiple numbers is provided', () => {
        const string = 'Hello, I contain the number 1000, I also contain 50:00';

        expect(momentIdentifier.findTimes(string)).toStrictEqual(['1000', '50:00']);

    });


    test('Test that findTimes returns null, when no number is provided', () => {
        const string = 'Hello, I do not contain the number';

        expect(momentIdentifier.findTimes(string)).toStrictEqual(null);
    });
});

describe('Tests to check formatNumberToTime is correctly formatting', () => {

    test('test that formatNumberToTime function correctly formats single number', () => {
        const number = ['2000'];

        expect(momentIdentifier.formatNumberToTime(number)).toStrictEqual(['20:00']);
    });

    test('test that formatNumberToTime function correctly formats multiple numbers', () => {
        const number = ['2000', '5000', '8000', '08:00', '10:00', '1200'];

        expect(momentIdentifier.formatNumberToTime(number)).toStrictEqual(['20:00', '50:00', '80:00', '08:00', '10:00', '12:00']);
    });
});

describe('Tests to check checkNumberIsTime is correctly identifying moments', () => {

    test('test that checkNumberIsTime function returns null if number does not match expected pattern', () => {
        const number = ['05:55'];

        expect(momentIdentifier.checkNumberIsTime(number)).toStrictEqual(['05:55']);
    });

    test('test that checkNumberIsTime function returns null if number does not match expected pattern', () => {
        const number =['5500'];

        expect(momentIdentifier.checkNumberIsTime(number)).toStrictEqual(null);
    });

    test('test that checkNumberIsTime function returns array with number if number does match expected pattern', () => {
        const number = ['20:00'];

        expect(momentIdentifier.checkNumberIsTime(number)).toStrictEqual(['20:00']);
    });
    
    test('test that checkNumberIsTime function returns null if time is invalid', () => {
        const number = ['99:99'];

        expect(momentIdentifier.checkNumberIsTime(number)).toStrictEqual(null);
    });
});

describe('Tests to check arrangeNumbers is correctly handling reply', () => {

    test('test that arrangeNumbers is arranging numbers correctly', () => {
        const numberArray = ['50', '100', '200', '300', '500'];

        expect(momentIdentifier.arrangeNumbers(numberArray)).toBe(`The numbers are:\n50 \n100 \n200 \n300 \n500`);
    });
});