//////////////////////////////////////////////////////////////////////////
// This work is licensed under GPL 3.0 - Read the LICENSE file attached //
//////////////////////////////////////////////////////////////////////////

const mainAppUI = document.forms.mainAppUI.elements;

const processButton = mainAppUI.processButton;
const copyButton = mainAppUI.copyButton;

let textBox = mainAppUI.userTextBox;
let lengthInput = mainAppUI.lineLength;
let formatInput = mainAppUI.outputFormatOption;
let resultBox = mainAppUI.resultTextBox;

processButton.addEventListener("click", mainApp);
copyButton.addEventListener("click", copyResult);

/**
 * This class contains the necessary data and methods to convert any text in the
 * poryasm or poryscript format.
 */
class Text {
    /** Whether it has been a new box or not. */
    #lineEndsWithL;
    #maxLineLength;
    #format;
    constructor(maxLineLength, format) {
        this.content = "";
        this.#lineEndsWithL = false;
        this.#maxLineLength = maxLineLength;
        this.#format = (format == "poryasm") ? 0 : 1 ;
    }

    /**
     * Receives the whole plain text from user input and processes it to
     * fit into a Pokémon ROM through the decompilation method.
     * @param {string} text 
     */
    processText (text) {
        let i;
        let textLines = text.split('\n');
        let textResult = "";

        for (i = 0; i < textLines.length; i++) {
            let line = textLines[i];
            if (line != "") {
                textResult += this.#processLine(line);
            }
            else {
                textResult = textResult.slice(0, -4);
                textResult += "\\p\"\n";
                this.#lineEndsWithL = false;
            }
        }
        textResult = textResult.slice(0, -5);
        if (this.#format == 0) {
            textResult += "$";
        }
        textResult += "\"";
        
        this.content = textResult;
    }

    /**
     * Receives one line from the whole plain text and formats into lines with the given maximum length.
     * @param {string} line Plain text line.
     * @returns {string} The resulting set of lines.
     */
    #processLine (line) {
        // format = 0 --> poryasm
        // format = 1 --> poryscript
        let lineWords = line.split(' ');
        let currentLineLength = 0;
        let newLineLength;
        let resultingText = this.#format ? "\"" : ".string \"";
        let word_index;

        for (word_index = 0; word_index < lineWords.length; word_index++) {
            let newWord = lineWords[word_index];

            // Check if the next word can be stored in the current line.
            newLineLength = currentLineLength + newWord.length;

            if (newLineLength <= this.#maxLineLength) {
                // The word can be stored. Add to the current content and append a space.
                resultingText += newWord + ' ';
                // Update the character counter, then add the space character to the count.
                currentLineLength = newLineLength;
                currentLineLength++;
            }
            else {
                // Remove the last space from the current content and append an End Of Line (EOL).
                resultingText = resultingText.slice(0, -1);
                // First EOL should be \n, the rest will be \l.
                resultingText += this.#lineEndsWithL ? '\\l\"\n' : '\\n\"\n';
                this.#lineEndsWithL = this.#lineEndsWithL ? this.#lineEndsWithL : true;
                // Add to the current content and append a space.
                resultingText += this.#format ? "\"" : ".string \"";
                resultingText += newWord + ' ';
                // Reset the character counter with the new word length and
                // then add the space character to the count.
                currentLineLength = newWord.length + 1;
            }
        }
        // Remove the last space from the resulting content and append an End Of Line (EOL).
        if(resultingText[resultingText.length - 1] == ' '){
            resultingText = resultingText.slice(0, -1);
        }
        resultingText += this.#lineEndsWithL ? '\\l\"\n' : '\\n\"\n';

        // Send the resulting text to the processText function.
        return resultingText;
    }
}

function getTextFromHtml () {
    text = textBox.value;
    return text;
}

function getLengthFromHtml () {
    let length = parseInt(lengthInput.value);
    return length;
}

function getFormatFromHtml () {
    let format = formatInput.value;
    return format;
}

function printResult (result) {
    resultBox.value = result;
}

function mainApp () {
    let htmlText = getTextFromHtml();
    let lineLength = getLengthFromHtml();
    let format = getFormatFromHtml();
    let textResult = new Text(lineLength, format);
    
    textResult.processText(htmlText);
    printResult(textResult.content);
}

function copyResult () {
    navigator.clipboard.writeText(resultBox.value);
}