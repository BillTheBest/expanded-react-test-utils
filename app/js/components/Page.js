define(function(require) {
    'use strict';

    var Controls = require('components/Controls');
    var ageData = require('data/ageData');
    var List = require('components/List');
    var Map = require('components/Map');
    var React = require('react');

    return React.createClass({
        getInitialState: function() {
            return {
                selectedAges: {
                    fifteenToNineteen: true,
                    fiveToNine: true,
                    tenToFourteen: true,
                    thirtyToThirtyFour: true,
                    twentyFiveToTwentyNine: true,
                    twentyToTwentyFour: true,
                    underFive: true
                }
            }
        },

        render: function() {
            return (
                <div className="page">
                    {this.getControlsMarkup()}
                    {this.getListMarkup()}
                    {this.getMapMarkup()}
                </div>
            );
        },

        getControlsMarkup: function() {
            return <Controls ageData={ageData} selectedAges={this.state.selectedAges} toggleAgeCallback={this.updateSelectedAges} />;
        },

        getListMarkup: function() {
            return <List ageData={ageData} selectedAges={this.state.selectedAges} />;
        },

        getMapMarkup: function() {
            return <Map ageData={ageData} selectedAges={this.state.selectedAges} />;
        },

        updateSelectedAges: function(selectedAges) {
            this.setState({
                selectedAges: selectedAges
            });
        }
    });
});
