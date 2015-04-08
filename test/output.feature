Feature: I want to test my bicycle

    Scenario: Count wheels
        Given I have a frame
        And I attach 2 wheels
        And I attach a saddle
        When I count the wheels
        Then I get 2
