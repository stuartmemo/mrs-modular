(function() {
	var Synth, keyboard, mySynth;

	Synth = (function() {
		var context = new webkitAudioContext(),
			nodes = [],
            samples = {};

        var assets = new AbbeyLoad([{
            'yo': 'yo.ogg'
        }], function (buffs) {
                samples.yo = buffs.yo;
            }
        );

		function Synth(name) {
			this.name = name;
            this.params = {
                attack: 0.1,
                sustain: 0.6,
                sample: null,
                volume: 0.5
            }
		}

        var playAudioFile= function (buffer, frequency) {
            var source = context.createBufferSource(),
                lowestFreq = 130,
                highestFreq = 350;

            var pbRate = 3 - (highestFreq / frequency);
            source.playbackRate.value = pbRate;
            source.buffer = buffer;
            source.connect(context.destination);
            source.noteOn(0);
        }

    	Synth.prototype.playNote = function(frequency) {
            var gainNode = context.createGainNode(),
                osc1 = context.createOscillator(),
                osc2 = context.createOscillator();

            if (this.params.sample) {
                playAudioFile(this.params.sample, frequency);
                return;
            }

    		osc1.frequency.value = frequency;
            osc2.frequency.value = frequency;

            osc1.type = document.getElementsByName('osc1-shape-selector')[0].value;
    		osc1.connect(gainNode);

            osc2.type = document.getElementsByName('osc2-shape-selector')[0].value;
            osc2.connect(gainNode);

            this.params.volume = document.getElementById('volume').value / 100;
            this.params.sustain = document.getElementById('sustain').value / 10;

            gainNode.gain.cancelScheduledValues(context.currentTime);
            gainNode.gain.value = 0;
            gainNode.gain.setValueAtTime(0, context.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.params.volume, context.currentTime + this.params.attack);
            gainNode.gain.linearRampToValueAtTime(0, context.currentTime + this.params.sustain);
    		gainNode.connect(context.destination);

            nodes.push(osc1);
            nodes.push(osc2);
            osc1.noteOn(0);
            osc2.noteOn(0);
        };

		Synth.prototype.endNote = function(frequency) {
			var nodesLength = nodes.length;

            nodes.forEach(function (node) {
            })
		};

        Synth.prototype.loadSample = function (sample) {
            this.params.sample = samples[sample];  
        }

		return Synth;

	})();

	mySynth = new Synth('Stuart');

	keyboard = qwertyHancock('keyboard', 620, 150, 3, 'A3', 'white', 'black', '#f3e939');

    document.getElementById('attack').addEventListener('change', function () {
        mySynth.params.attack = this.value;
    });

    document.getElementsByName('sample-selector')[0].addEventListener('change', function () {
        mySynth.loadSample(this.value);
    });

	keyboard.keyDown(function(note, frequency) {
		return mySynth.playNote(frequency);
	});

	keyboard.keyUp(function(note, frequency) {
		return mySynth.endNote(frequency);
	});

}).call(this);
