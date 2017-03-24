var app = new Vue({
  el: '#app-widget',
  data: {
    pads: [],
    inputs: [],
    input: null,
    bindMode: false,
    padInput: null,
    midiInput: null,
    selectedInput: null,
    volume: null,
  },
  mounted() {
    WebMidi.enable(function (err) {
      if (err) {
        console.log("WebMidi could not be enabled.", err);
      } else {
        console.log("WebMidi enabled!");
      }
      app.inputs = WebMidi.inputs;
    });

    this.pads = [{
      key: '82',
      letter: 'R',
      midi: null,
      audio: new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/SD0025.mp3')
    },{
      key: '84',
      letter: 'T',
      midi: null,
      audio: new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/SD0010.mp3')
    },{
      key: '89',
      letter: 'Y',
      midi: null,
      audio: new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/SD0000.mp3')
    },{
      key: '85',
      letter: 'U',
      midi: null,
      audio: new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/MA.mp3')
    },{
      key: '70',
      letter: 'F',
      midi: null,
      audio: new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/CY0010.mp3')
    },{
      key: '71',
      letter: 'G',
      midi: null,
      audio: new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/CH.mp3')
    },{
      key: '72',
      letter: 'H',
      midi: null,
      audio: new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/CB.mp3')
    },{
      key: '74',
      letter: 'J',
      midi: null,
      audio: new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/BD0010.mp3')
    },{
      key: '86',
      letter: 'V',
      midi: null,
      audio: new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/242518/CP.mp3')
    },{
      key: '66',
      letter: 'B',
      midi: null,
      audio: new Audio('samples/bass.wav')
    }];

    this.volume = {
      key: 'volume',
      letter: 'volume',
      midi: null,
      value: 10,
      max: 100,
      audio: new Audio('samples/bass.wav')
    };

    var pads = this.pads;

    window.addEventListener('keydown', function(e) {
      var pad = pads.find( pad => pad.key == e.keyCode );
      if (pad) {
        pad.audio.load();
        pad.audio.play();
      }
    });

  },
  methods: {
    play (index) {
      this.pads[index].audio.load();
      this.pads[index].audio.play();
    },
    setId (key) {
      return 'padKey' + key;
    },
    bind (index) {
      this.bindMode = true;
      this.padInput = this.pads[index];
      document.getElementById('padKey'+this.padInput.key).classList.add("active");
    },
    bindVolume () {
      this.bindMode = true;
      this.padInput = this.volume;
    },
    validate () {
      this.bindMode = false;
      if (this.padInput.key == 'volume') {
        this.volume.midi = this.midiInput;
      } else {
        document.getElementById('padKey'+this.padInput.key).classList.remove("active");
        this.getPad(this.padInput.key).midi = this.midiInput;
      }
      this.padInput = null;
      this.midiInput = null;
    },
    getPad (key) {
      return this.pads.find( pad => pad.key == key );
    },
    getPadByMidi (midi) {
      return this.pads.find( pad => pad.midi == midi );
    },
    selectInput () {

        var input = this.inputs[this.selectedInput];
        var count = 0;

        input.addListener('pitchbend', "all", function(e) {
            console.log("Pitch value: " + e.value);
        });

        input.addListener('noteon', "all",
          function (e) {
            if (app.bindMode) {
              app.midiInput = e.note.name + e.note.octave;
            } else {
              var pad = app.getPadByMidi(e.note.name + e.note.octave);
              if (pad) {
                pad.audio.load();
                pad.audio.play();
              }
            }
            // console.log("Received 'noteon' message (" + e.note.name + e.note.octave + ").");
          }
        );

        // Listen to control change message on all channels
        input.addListener('controlchange', "all",
          function (e) {
            ++count;

            if (count == 1) {
              if (app.bindMode) {
                app.volume.max = e.value;
                console.log(app.volume.max);
              }
            }
            if (count == 2) {
              // console.log("Received 'controlchange' message.", e);
              if (app.bindMode) {
                app.midiInput = e.controller.number;
              } else {
                if (app.volume.midi == e.controller.number) {
                  // console.log(app.volume);
                  // console.log(e.value);
                  app.volume.value = (e.value * 100) / app.volume.max;
                  // console.log(app.volume.value);
                }
              }
            }
            if (count >= 3) {
              count = 0;
            }
          }
        );

    }
  }
});
