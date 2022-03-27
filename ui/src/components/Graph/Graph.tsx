import * as React from 'react';
import { useEffect, useState } from 'react';
import { GraphReponseData } from '../Gym/Gym';
import { Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Alert, Fab } from '@mui/material';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import './Graph.css';
import { BrowserView } from 'react-device-detect';

export interface GraphProps {
    graphResponseData: GraphReponseData,
    loading: boolean,
}

export interface OriginalGraphData {
    date: string,
    count: number,
}

let originalData: Map<string, OriginalGraphData[]> = new Map();

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>): JSX.Element | null => {
    if (active && payload !== null) {
        return (
            <div className="custom-tooltip">
                <p className="label">{`Date: ${label}`}</p>
                <p className="info">{`Member count: ${payload![0].value}`}</p>
            </div>
        );
    }

    return null;
}

export default function Graph(props: GraphProps) {
    const [gymName, setGymName] = useState("Unknown gym");
    const [graphData, setGraphData] = useState<OriginalGraphData[]>([]);
    const [currentActiveMembers, setCurrentActiveMembers] = useState(0);

    const [selecting, setSelecting] = useState(false);
    const [refAreaLeft, setRefAreaLeft] = useState(0);
    const [refAreaRight, setRefAreaRight] = useState(0);
    const [refAreaLeftIndex, setRefAreaLeftIndex] = useState(0);
    const [refAreaRightIndex, setRefAreaRightIndex] = useState(0);

    useEffect(() => {
        if (!props.loading && props.graphResponseData) {
            let graphPoints: OriginalGraphData[] = [];
            for (let i = 0; i < props.graphResponseData.revo_graph_data.length; i++) {
                let entry = props.graphResponseData.revo_graph_data[i];

                let date = new Date(0); // Set date to epoch
                date.setUTCSeconds(entry.epoch);

                let dateString = date.toDateString();
                let niceDate = dateString.replaceAll(dateString.split(" ")[3], "");
                let niceDateString = niceDate + date.toLocaleTimeString();

                graphPoints.push({ date: niceDateString, count: entry.count });
            }

            graphPoints = graphPoints.reverse();
            setGraphData(graphPoints);
            originalData.set(props.graphResponseData.revo_gyms[0].name, graphPoints);
            setCurrentActiveMembers(graphPoints[graphPoints.length - 1].count);

            // If exists, set gym name.
            if (props.graphResponseData.revo_gyms.length > 0) {
                setGymName(props.graphResponseData.revo_gyms[0].name);
            }
        }
    }, [props.loading, props.graphResponseData]);

    let zoom = () => {
        if (refAreaLeft === refAreaRight) {
            setRefAreaLeft(0);
            setRefAreaRight(0);
            return;
        }

        let newGraphData;
        if (refAreaLeftIndex > refAreaRightIndex) {
            newGraphData = graphData.slice(refAreaRightIndex, refAreaLeftIndex);
        } else {
            newGraphData = graphData.slice(refAreaLeftIndex, refAreaRightIndex);
        }

        setSelecting(false);
        setRefAreaLeft(0);
        setRefAreaRight(0);
        setGraphData(newGraphData);
    };

    let zoomOut = () => {
        if (originalData.has(gymName)) {
            const data: OriginalGraphData[] = originalData.get(gymName)!!;
            setGraphData(data);
        }
    };

    return (
        <div>
            <header className="graph-header">
                <h1>Members at {gymName}</h1>
            </header>

            <BrowserView>
                <div className={"graph-buttons"}>
                    <Fab color="secondary" aria-label="zoom" onClick={zoomOut}>
                        <ZoomOutIcon />
                    </Fab>
                </div>
            </BrowserView>

            {graphData &&
                <div>
                    <p className={"current-member-count"}>{currentActiveMembers} members currently at {gymName}</p>
                </div>
            }
            <div className="graph">
                {graphData && graphData.length === 0 && <Alert severity="error">Error. No graph data found.</Alert>}
                {graphData &&
                    <BrowserView>
                        <ResponsiveContainer className={"graph-container"}>
                            <LineChart data={graphData}
                                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                                onMouseDown={(e: any) => {
                                    setSelecting(true);
                                    setRefAreaLeft(e.activeLabel);
                                    setRefAreaLeftIndex(e.activeTooltipIndex);
                                }}
                                onMouseMove={(e: any) => {
                                    if (selecting && refAreaLeft) {
                                        setRefAreaRight(e.activeLabel);
                                        setRefAreaRightIndex(e.activeTooltipIndex);
                                    }
                                }}
                                onMouseUp={zoom}>
                                <XAxis dataKey={"date"} type={"category"} />
                                <YAxis yAxisId="1" />
                                <Line type="monotone" dataKey="count" stroke="#8884d8" yAxisId="1" />
                                <Tooltip content={<CustomTooltip />} />

                                {refAreaLeft !== 0 && refAreaRight !== 0 ? (
                                    <ReferenceArea yAxisId="1" x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.8} />) : null}
                            </LineChart>
                        </ResponsiveContainer>
                    </BrowserView>
                }
            </div>
        </div>
    );
}