import React from 'react';
import PropTypes from 'prop-types';
import range from 'lodash.range';
import classNames from 'classnames';

import Key from './Key';
import { noteToMidiNumber, getMidiNumberAttributes } from './midiHelpers';

function ratioToPercentage(ratio) {
  return `${ratio * 100}%`;
}

class Keyboard extends React.Component {
  static defaultProps = {
    config: {
      keyWidthToHeightRatio: 0.15, // TODO: use props.height instead?
      whiteKeyGutterRatio: 0.02,
      whiteKey: {
        widthRatio: 1,
        heightRatio: 1,
        heightKeyDownRatio: 0.98,
      },
      blackKey: {
        widthRatio: 0.66,
        heightRatio: 0.66,
        heightKeyDownRatio: 0.65,
      },
      noteOffsetsFromC: {
        C: 0,
        Db: 0.55,
        D: 1,
        Eb: 1.8,
        E: 2,
        F: 3,
        Gb: 3.5,
        G: 4,
        Ab: 4.7,
        A: 5,
        Bb: 5.85,
        B: 6,
      },
    },
    renderNoteLabel: () => {},
  };

  // Range of midi numbers from startNote to endNote
  getMidiNumbers() {
    return range(this.props.startNote, this.props.endNote + 1);
  }

  getWhiteKeyCount() {
    return this.getMidiNumbers().filter((number) => {
      const { isAccidental } = getMidiNumberAttributes(number);
      return !isAccidental;
    }).length;
  }

  // Width of the white key as a ratio from 0 to 1, including the small space between keys
  getWhiteKeyWidthIncludingGutter() {
    return 1 / this.getWhiteKeyCount();
  }

  // Width of the white key as a ratio from 0 to 1
  getWhiteKeyWidth() {
    return this.getWhiteKeyWidthIncludingGutter() * (1 - this.props.config.whiteKeyGutterRatio);
  }

  // Key position is represented by the number of white key widths from the left
  getKeyPosition(midiNumber) {
    const OCTAVE_WIDTH = 7;
    const { octave, basenote } = getMidiNumberAttributes(midiNumber);
    const offsetFromC = this.props.config.noteOffsetsFromC[basenote];
    const { basenote: startBasenote, octave: startOctave } = getMidiNumberAttributes(
      this.props.startNote,
    );
    const startOffsetFromC = this.props.config.noteOffsetsFromC[startBasenote];
    const offsetFromStartNote = offsetFromC - startOffsetFromC;
    const octaveOffset = OCTAVE_WIDTH * (octave - startOctave);
    return offsetFromStartNote + octaveOffset;
  }

  getKeyConfig(midiNumber) {
    return getMidiNumberAttributes(midiNumber).isAccidental
      ? this.props.config.blackKey
      : this.props.config.whiteKey;
  }

  getWidth() {
    return this.props.width ? this.props.width : '100%';
  }

  getHeight() {
    return this.props.width
      ? `${this.props.width * this.getWhiteKeyWidth() / this.props.config.keyWidthToHeightRatio}px`
      : '100%';
  }

  render() {
    return (
      <div
        className="ReactPiano__Keyboard"
        style={{ width: this.getWidth(), height: this.getHeight() }}
      >
        {this.getMidiNumbers().map((num) => {
          const { note, basenote, isAccidental } = getMidiNumberAttributes(num);
          const keyConfig = this.getKeyConfig(num);
          const isKeyDown = this.props.activeNotes.includes(num);
          return (
            <Key
              className={classNames('ReactPiano__Key', {
                'ReactPiano__Key--black': isAccidental,
                'ReactPiano__Key--white': !isAccidental,
                'ReactPiano__Key--disabled': this.props.disabled,
                'ReactPiano__Key--down': isKeyDown,
              })}
              left={ratioToPercentage(
                this.getKeyPosition(num) * this.getWhiteKeyWidthIncludingGutter(),
              )}
              width={ratioToPercentage(keyConfig.widthRatio * this.getWhiteKeyWidth())}
              height={ratioToPercentage(
                isKeyDown ? keyConfig.heightKeyDownRatio : keyConfig.heightRatio,
              )}
              onNoteStart={this.props.onNoteStart.bind(this, num)}
              onNoteStop={this.props.onNoteStop.bind(this, num)}
              gliss={this.props.gliss}
              touchEvents={this.props.touchEvents}
              key={num}
            >
              {this.props.disabled ? null : this.props.renderNoteLabel(num)}
            </Key>
          );
        })}
      </div>
    );
  }
}

Keyboard.propTypes = {
  startNote: PropTypes.number.isRequired,
  endNote: PropTypes.number.isRequired,
  activeNotes: PropTypes.arrayOf(PropTypes.number),
  onNoteStart: PropTypes.func.isRequired,
  onNoteStop: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  gliss: PropTypes.bool,
  touchEvents: PropTypes.bool,
  renderNoteLabel: PropTypes.func,
  width: PropTypes.number,
};

export default Keyboard;
