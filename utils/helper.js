const CircularJSON = require("circular-json");
const Bcrypt = require('bcrypt');


module.exports = {
    generateOtpByLength: function (length) {
        var result = '';
        var characters = '0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
    /**
     * @description To convert string to upper case
     * @param {*} str
     * @returns {*}
     */
    toUpperCase: (string) => {
        if (string.length > 0) {
            const newString = string
                .toLowerCase()
                .replace(/_([a-z])/, (m) => m.toUpperCase())
                .replace(/_/, '');
            return string.charAt(0).toUpperCase() + newString.slice(1);
        }

        return '';
    },

    /**
     * @description This function use for create validation unique key
     * @param apiTag
     * @param error
     * @returns {*}
     */
    validationMessageKey: (apiTag, error) => {
        let key = module.exports.toUpperCase(error.details[0].context.key);
        let type = error.details[0].type.split('.');
        type = module.exports.toUpperCase(type[1]);
        key = apiTag + key + type;
        return key;
    },

    /**
     * @description This function use for create random digits
     * @param length
     * @returns {*}
     */
    makeRandomDigit: (length) => {
        let result = '';
        const characters = '0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },

    /**
     * @description This function is used to generate random string
     * @param {*} length
     * @returns {*}
     */
    makeRandomString: (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },

    /**
     * @description This function is used to convert string of id to mongodb ObjectId
     * @param {*} string
     * @returns {*}
     */
    toObjectId: (string) => {
        return Mongoose.Types.ObjectId(string);
    },

    /**
     * @description This function is used to generate today's date only.
     * @returns {*}
     */
    currentDateOnly: () => {
        const currentDate = new Date();
        const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
        const date = ('0' + currentDate.getDate()).slice(-2);
        return new Date(`${currentDate.getFullYear()}-${month}-${date}`);
    },

    /**
     * @description This function is used to perform javascript pagination
     * @param {*} array
     * @param {*} perPage
     * @param {*} offset
     * @returns {*}
     */
    pagination: (array, perPage, offset) => {
        if (array.length > 0) {
            return array.slice(offset).slice(0, perPage);
        } else {
            return [];
        }
    },

    /**
     * @description This function is used to calculate average value
     * @param {*} sumValue
     * @param {*} numberValue
     * @param {*} decimal
     * @returns {*}
     */
    averageValue: (sumValue, numberValue, decimal) => {
        const average = parseFloat((sumValue / numberValue).toFixed(decimal));
        return average;
    },

    /**
     * @description this function is used to get unix timestamp
     * @param {*} date
     * @returns {*}
     */
    unixTimeStamp: (date) => {
        return Math.floor(date.getTime() / 1000);
    },

    /**
     * @description This function is used to select random item from an array
     * @param {*} arr
     * @returns {*}
     */
    getRandomItem: (arr) => {
        const randomIndex = Math.floor(Math.random() * arr.length);
        const item = arr[randomIndex];
        return item;
    },

    /**
     * @description This function is used to get shuffled array
     * @param {*} array
     * @returns {*}
     */
    shuffleArray: (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    /**
     * @description This function is used to calculate percentage
     * @param {*} value
     * @param {*} total
     * @returns {*}
     */
    calculatePercentage: (value, total) => {
        if (total === 0) {
            return 0;
        }
        const percentage = ((value / total) * 100).toFixed(2);
        return parseFloat(percentage);
    },

    convertObjectKeysToCamelCase: (obj) => {
        const processed = new Set();

        const replacer = (_key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (processed.has(value)) {
                    return '[Circular]';
                }
                processed.add(value);
            }
            return value;
        };

        const jsonString = CircularJSON.stringify(obj, replacer);
        const parsedObj = JSON.parse(jsonString);

        const convertKeysRecursive = (data) => {
            if (typeof data !== 'object' || data === null) {
                return data;
            }

            if (Array.isArray(data)) {
                return data.map((item) => convertKeysRecursive(item));
            }

            const result = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    let camelCaseKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                    camelCaseKey = camelCaseKey.charAt(0).toLowerCase() + camelCaseKey.slice(1); // Convert first letter to lowercase
                    result[camelCaseKey] = convertKeysRecursive(data[key]);
                }
            }
            return result;
        };

        return convertKeysRecursive(parsedObj);
    },

    getDaysDifference: (startDate, endDate = new Date().toISOString().split('T')[0]) => {
        const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
        const start = new Date(startDate);
        start.setDate(start.getDate() - 1);
        const end = new Date(endDate); // Current date
        const daysDifference = Math.round((end - start) / oneDay);
        return daysDifference;
    },
    getDatesArray: (startDate, endDate = new Date()) => {
        const datesArray = [];
        const current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            const dateToPush = new Date(current);
            datesArray.push(dateToPush.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1); // Increment the date by 1 day
        }

        return datesArray;
    },

    replaceUnderscoreWithSpace: (str) => {
        const wordList = str.split('_');
        const updatedStr = wordList.reduce((prev, curr) => {
            return prev + ' ' + curr;
        });
        console.log(updatedStr);
        return updatedStr;
    },
      /**
   * @description This function is used to hash password
   * @param {*} password
   * @returns {*}
   */
  generatePassword: (password) => {
    return new Promise((resolve, reject) =>
      Bcrypt.hash(password, 10, (err, hash) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        if (err) reject();
        resolve(hash);
      })
    );
  }
};