# Gherkin Definitions

This is a script that takes takes Gherkin feature files enriched with `Definition` blocks and outputs orindary Gherkin feature files that can be read by Cucumber.

As an example, take this input file:

```cucumber
Feature: I want to test my bicycle

    Scenario: Count wheels
        Given I have a bicycle with 2 wheels
        When I count the wheels
        Then I get 2

Definition: I have a bicycle with <numberOfWheels> wheels
    Given I have a frame
    And I attach <numberOfWheels> wheels
    And I attach a saddle
```

Gherkin-definitions turns this into the following output:

```cucumber
Feature: I want to test my bicycle

    Scenario: Count wheels
        Given I have a frame
        And I attach 2 wheels
        And I attach a saddle
        When I count the wheels
        Then I get 2
```

Because definition steps get expanded in the features that are run, the test output will contain all these steps.
We can mitigate this in the future by writing a custom formatter that cleans up the output.

## Usage

`gherkin-definitions` exports a function that transforms a file with definitions to one where definition steps have been expanded:

```js
    var input = fs.readFileSync('/path/to/my/file', { encoding: 'utf8' });
    var output = require('gherkin-definitions')(input);
    fs.writeFileSync('/path/to/output', output);
```

Included is also a gulp task, which can be used like this:

```js
    var gherkinDefinitions = require('gherkin-definitions/gulp');
    gulp.task('expand-gherkin-definitions', function() {
        gulp.src('./features/**/*.feature')
            .pipe(gherkinDefinitions)
            .pipe(gulp.dest('./expanded-features'));
    });
```

Now you can run your tests against the `expanded-features` directory instead of the `features` one.

## Motivation

We want a way to compose steps out of other steps for use in cucumber.js.
This seemed the easiest solution to get the job done.

Although some in the cucumber community consider putting to much (or any) logic into steps something of an antipattern, for us it makes sense.
We primarily use (abuse?) Gherkin as a basic programming language (see Minosse) allowing our testers to work independently on automated testcases.
The recommended approach of tackling reduction in the step implementations is at odds with this, because it requires diving into another language (the one the steps are written in).
Hence the need for a way to write gherkin 'functions', to keep our feature files clean and readable.
