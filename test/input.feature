Definition: I have a bicycle with <numberOfWheels> <attribute>
    Given I have a frame
    And I attach <numberOfWheels> <attribute>
    And I attach a saddle

Feature: I want to test my bicycle

    Scenario: Count wheels
        Given I have a bicycle with 2 wheels
        When I count the wheels
        Then I get 2
