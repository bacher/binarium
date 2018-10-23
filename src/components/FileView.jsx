import React, { PureComponent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';

const HEX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

const Root = styled.div`
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
`;

const Header = styled.div`
    padding: 2px 0;
    background: #ffedc7;
`;

const Line = styled.div`
    ${is('green')`
        background: #ebffeb;
    `};

    ${is('red')`
        background: #ffd9d9;
    `};
`;

const LineNumber = styled.span`
    display: inline-block;
    width: 40px;
    padding: 0 5px;
    margin-right: 5px;
    text-align: right;
    background: antiquewhite;
`;

const Cell = styled.span`
    ${is('same')`
        color: #888;
    `};

    ${is('red')`
        background: red;
    `};

    ${is('green')`
        background: green;
    `};

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
        buffers: null,
    };

    onFileChange = e => {
        const files = e.target.files;

        if (!files || files.length === 0) {
            return;
        }

        const buffers = [];

        for (let file of files) {
            const reader = new FileReader();

            reader.addEventListener('load', () => {
                buffers.push(new Uint8Array(reader.result));
                check();
            });

            reader.readAsArrayBuffer(file);
        }

        const check = () => {
            if (buffers.length === files.length) {
                this.setState({
                    buffers,
                });
            }
        };
    };

    renderCells(bytes, start, count, diffArray, isSecond) {
        const cells = [];
        let allSame = true;

        for (let i = 0; i < count && start + i < bytes.length; i++) {
            const byte = bytes[start + i];

            const isSame = diffArray && byte === diffArray[start + i];

            if (allSame) {
                allSame = isSame;
            }

            const high = Math.floor(byte / 16);
            const low = byte - high * 16;

            if (i !== 0 && i % 4 === 0) {
                cells.push(<Splitter key={100 + i} />);
            }

            cells.push(
                <Cell key={i} same={isSame} red={isSecond && !isSame} green={!isSecond && !isSame}>
                    {HEX[high] + HEX[low]}
                </Cell>
            );
        }

        return {
            cells,
            allSame,
        };
    }

    renderLine(buffers, line, start, count) {
        const bytes = buffers[0];
        const bytes2 = buffers[1];

        const { cells, allSame } = this.renderCells(bytes, start, count, bytes2, false);

        const lines = [
            <Line key={line} green={!allSame}>
                <LineNumber>{line}</LineNumber>
                {cells}
            </Line>,
        ];

        if (!allSame) {
            const { cells } = this.renderCells(bytes2, start, count, bytes, true);

            lines.push(
                <Line key={line + '_kek'} red>
                    <LineNumber>{line}</LineNumber>
                    {cells}
                </Line>
            );
        }

        return lines;
    }

    renderBytes() {
        const { buffers } = this.state;

        const bytes = buffers[0];

        const LINE_WIDTH = 32;

        const linesCount = Math.ceil(bytes.length / LINE_WIDTH);
        const lines = [];

        for (let line = 0; line < linesCount; line++) {
            lines.push(...this.renderLine(buffers, line, line * LINE_WIDTH, LINE_WIDTH));
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
        const { buffers } = this.state;

        return (
            <div>
                <input type="file" multiple onChange={this.onFileChange} />
                {buffers ? this.renderBytes() : null}
            </div>
        );
    }
}
