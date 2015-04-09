var SECTION_START_REGEX = /^\s*\w+:/;
var DEFINITION_START_REGEX = /^\s*Definition:(.*)$/;
var STEP_REGEX = /^(\s*)(?:GIVEN|WHEN|THEN|AND|BUT)(.*)$/i;
var PLACEHOLDER_GROUP_REGEX = /<.*?>/g;
var definitions = [];

function pullDefinitions(inputString) {
    var inputLines = inputString.split('\n');
    var definitionLineSets = [];
    var definitionLines = null;
    var inDefinition = false;
    var outputLines = inputLines.filter(function getDefinitionLine(line) {
        var sectionStarts = SECTION_START_REGEX.test(line);
        if (sectionStarts) {
            inDefinition = false;
        }
        var definitionStarts = DEFINITION_START_REGEX.test(line);
        if (definitionStarts) {
            definitionLines = [];
            definitionLineSets.push(definitionLines);
            inDefinition = true;
        }
        if (inDefinition) {
            definitionLines.push(line);
        }
        return !inDefinition;
    });
    var newDefinitions = definitionLineSets.map(definitionFromLines);
    definitions = definitions.concat(newDefinitions);
    return outputLines.join('\n');
}

function definitionFromLines(lines) {
    var headerLine = lines.shift();
    var header = headerLine.match(DEFINITION_START_REGEX)[1].trim();
    var definitionPlaceholders = header.match(PLACEHOLDER_GROUP_REGEX) || [];
    var matcher = new RegExp(header.replace(PLACEHOLDER_GROUP_REGEX, '(.*?)'));
    var steps = lines
        .filter(function removeEmptyLines(stepLine) {
            return (stepLine !== '');
        })
        .map(function trimLines(stepLine) {
            stepLine = stepLine.trim();
            var stepPlaceholders = stepLine.match(PLACEHOLDER_GROUP_REGEX) || [];
            stepPlaceholders.forEach(validateStepPlaceholder.bind(null, definitionPlaceholders));
            return stepLine.trim();
        });
    var definition = {
        header: header,
        placeholders: definitionPlaceholders,
        matcher: matcher,
        steps: steps
    };
    return definition;
}

function validateStepPlaceholder(definitionPlaceholders, stepPlaceholder) {
    var validPlaceholder = (definitionPlaceholders.indexOf(stepPlaceholder) !== -1);
    if (!validPlaceholder) {
        throw new Error('Placeholder ' + stepPlaceholder +
                        ' must be included in definition header to be used in its steps.');
    }
}

function insertDefinitions(inputString) {
    var inputLines = inputString.split('\n');
    var outputLines = [];
    inputLines.forEach(function maybeReplaceStep(line) {
        var expandedLines = maybeExpandLine(line);
        if (!expandedLines) {
            //It's not a line that matches a definition.
            return outputLines.push(line);
        }
        outputLines = outputLines.concat(expandedLines);
    });
    return outputLines.join('\n');
}

function maybeExpandLine(line) {
    var stepMatch = STEP_REGEX.exec(line);
    if (!stepMatch) {
        //It's not a step.
        return null;
    }
    var indentation = stepMatch[1];
    var stepBody = stepMatch[2].trim();
    var definitionMatch = null;
    var definition = null;
    var i = 0, len = definitions.length;
    while (!definitionMatch && i < len) {
        definition = definitions[i];
        definitionMatch = definition.matcher.exec(stepBody);
        i++;
    }
    if (!definitionMatch) {
        //It's not a definition step.
        return null;
    }
    var placeholders = definition.placeholders;
    var replacers = definitionMatch.slice(1);
    var expandedLines = definition.steps.map(function expandStep(step) {
        var expandedStep = step;
        placeholders.forEach(function replacePlaceholder(placeholder, index) {
            expandedStep = expandedStep.replace(placeholder, replacers[index]);
        });
        return indentation + expandedStep;
    });
    return expandedLines;
}

function expandDefinitions(input) {
    var pulledDefinitions = pullDefinitions(input);
    var output = insertDefinitions(pulledDefinitions);
    return output;
}

module.exports = expandDefinitions;
module.exports.pullDefinitions = pullDefinitions;
module.exports.insertDefinitions = insertDefinitions;
