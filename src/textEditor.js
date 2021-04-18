import React from 'react';
import RichTextEditor, {EditorValue} from 'react-rte';
import {RichUtils, EditorState} from 'draft-js'
import {X} from 'react-feather';

// https://github.com/sstur/react-rte/blob/master/src/EditorDemo.js
// https://github.com/sstur/react-rte/blob/8c81622706a5f8856d39497bf33f92a97e9664fc/src/lib/EditorValue.js#L42

// Demonstrates how to add links
// https://codepen.io/Kiwka/pen/ZLvPeO

export default class RichEditor extends React.Component {
    editorValue = RichTextEditor.createEmptyValue();
    state = {
        value: this.editorValue,
        files: this.props.files,
        showDropdown: false,
    }
    
    componentDidUpdate(prevProps, prevState, snapshot){
      if(this.props.initialValue !== prevProps.initialValue){
        this.setState({
          value: RichTextEditor.createValueFromString(this.props.initialValue, 'html'),
        });
      }
    }
    
    onChange = (value) => {
        this.setState({value});
        if (this.props.onChange) {
          // Send the changes up to the parent component as an HTML string.
          // This is here to demonstrate using `.toString()` but in a real app it
          // would be better to avoid generating a string on each change.
          // console.log('value.tostring(): ', value.toString('html'));
          this.props.onChange(
            value.toString('html')
          );
        }
    };
    
    render () {
      // console.log(this.state.value);

        const toolbarConfig = {
            display: [
                'INLINE_STYLE_BUTTONS', 
                'BLOCK_TYPE_BUTTONS', 
                'BLOCK_TYPE_DROPDOWN', 
                'LINK_BUTTONS', 
                //'HISTORY_BUTTONS'
            ],
            INLINE_STYLE_BUTTONS: [
              {label: 'Bold', style: 'BOLD', className: 'custom-css-class'},
              {label: 'Italic', style: 'ITALIC'},
              {label: 'Underline', style: 'UNDERLINE'},
            ],
            BLOCK_TYPE_DROPDOWN: [
              {label: 'Normal', style: 'unstyled'},
              {label: 'Small Title', style: 'header-three'},
              {label: 'Medium Title', style: 'header-two'},
              {label: 'Large Title', style: 'header-one'},
            ],
            BLOCK_TYPE_BUTTONS: [
              {label: 'UL', style: 'unordered-list-item'},
              {label: 'OL', style: 'ordered-list-item'}
            ]
        };

        return (
          <RichTextEditor
            value={this.state.value}
            onChange={this.onChange}
            toolbarConfig={toolbarConfig}
            customControls={[
              (setValue, getValue, editorState) => {
                return this.props.files
                  ? <div className="link-file" onClick={()=>{
                      console.log('Link to file clicked: ', this.props.files);
                      // console.log(window.getSelection().toString());
                      this.setState({
                        showDropdown: !this.state.showDropdown,
                      });
                      // setValue('custom-file-link', this.state.value);
                    }} style={{display: this.props.files.length ? "inline-block" : "none"}}>
                      { this.state.showDropdown 
                        ? <X /> 
                        : "Link to a file"
                      }
                      <div className={"link-file-dropdown " + (this.state.showDropdown ? "showing" : "")}>
                        {
                          this.props.files.map((file, i)=>(
                            <div key={"link-file-"+i} onClick={()=>{
                              console.log('file selected: ', file);

                              var selectionState = editorState.getSelection();
                              var anchorKey = selectionState.getAnchorKey();
                              var contentState = editorState.getCurrentContent();
                              const contentStateWithEntity = contentState.createEntity(
                                'LINK',
                                'MUTABLE',
                                {url: `file:${file.id}`, //file.name
                                class: "file-link"
                                }
                              )
                              const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
                              const newEditorState = EditorState.set(editorState, {
                                currentContent: contentStateWithEntity,
                              });

                              const newValue = new EditorValue(
                                RichUtils.toggleLink(
                                  newEditorState,
                                  newEditorState.getSelection(),
                                  entityKey,
                                'html'),
                              )

                              this.setState({
                                value: newValue
                              })
                              this.props.onChange(
                                newValue.toString('html')
                              );

                            }}>
                              <span>{file.name}</span>
                            </div>
                          ))
                        }
                      </div>
                  </div>
                  : ""
              },
            ]}
          />
        );
    }
}

