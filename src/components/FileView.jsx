import React, { PureComponent } from 'react';
import styled from 'styled-components';

const HEX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

const Root = styled.div`
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
`;

const Header = styled.div`
    padding: 2px 0;
    background: #ffedc7;
`;

const Line = styled.div``;

const LineNumber = styled.span`
    display: inline-block;
    width: 40px;
    padding: 0 5px;
    margin-right: 5px;
    text-align: right;
    background: antiquewhite;
`;

const Cell = styled.span`
    &::after {
        content: ' ';
    }
`;

const Splitter = styled.span`
    display: inline-block;
    width: 16px;
`;

export default class FileView extends PureComponent {
    state = {
        bytes: null,
    };

    onFileChange = e => {
        const reader = new FileReader();

        reader.addEventListener('load', () => {
            const bytes = new Uint8Array(reader.result);

            this.setState({
                bytes,
            });
        });

        reader.readAsArrayBuffer(e.target.files[0]);
    };

    renderLine(bytes, start, count) {
        const cells = [];

        for (let i = 0; i < count && start + i < bytes.length; i++) {
            const byte = bytes[start + i];

            const high = Math.floor(byte / 16);
            const low = byte - high * 16;

            if (i !== 0 && i % 4 === 0) {
                cells.push(<Splitter key={100 + i} />);
            }

            cells.push(<Cell key={i}>{HEX[high] + HEX[low]}</Cell>);
        }

        return cells;
    }

    renderBytes() {
        const { bytes } = this.state;

        const LINE_WIDTH = 32;

        const linesCount = Math.ceil(bytes.length / LINE_WIDTH);
        const lines = [];

        for (let line = 0; line < linesCount; line++) {
            lines.push(
                <Line key={line}>
                    <LineNumber>{line}</LineNumber>
                    {this.renderLine(bytes, line * LINE_WIDTH, LINE_WIDTH)}
                </Line>
            );
        }

        return (
            <Root>
                <Header>
                    <LineNumber />
                    00 01 02 03 <Splitter />
                    04 05 06 07 <Splitter />
                    08 09 10 11 <Splitter />
                    12 13 14 15 <Splitter />
                    16 17 18 19 <Splitter />
                    20 21 22 23 <Splitter />
                    24 25 26 27 <Splitter />
                    28 29 31 32 <Splitter />
                </Header>
                {lines}
            </Root>
        );
    }

    render() {
        const { bytes } = this.state;

        return (
            <div>
                <input type="file" onChange={this.onFileChange} />
                {bytes ? this.renderBytes() : null}
            </div>
        );
    }
}
