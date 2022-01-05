import {gql, useQuery} from '@apollo/client';
import {Alert, LinearProgress} from '@mui/material';
import React, {useEffect, useState} from 'react';
import Graph from '../Graph/Graph';

const GET_GRAPH_DATA = gql`
    query GetGraphData($gymId: Int!, $sinceEpoch: Int!) {
        revo_graph_data(where: {gym_id: {_eq: $gymId, _gt: $sinceEpoch}, epoch: {}}, order_by: {entry: desc}) {
            count
            epoch
        }
        revo_gyms(where: {id: {_eq: $gymId}}) {
            name
        }
    }
`;

export interface RevoGraphData {
    count: number;
    epoch: number;
};

export interface RevoGymData {
    name: string;
};

export interface GraphReponseData {
    revo_graph_data: RevoGraphData[],
    revo_gyms: RevoGymData[],
};

export interface GymProps {
    gymId: number,
};

export default function Gym(props: GymProps): JSX.Element {
    // Set the max date to a week ago
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - 7);

    const [graphData, setGraphData] = useState(null);
    const {loading, error, data} = useQuery(GET_GRAPH_DATA, {
        variables: {
            gymId: props.gymId,
            sinceEpoch: sinceDate.getTime()
        }
    });

    useEffect(() => {
        if (!loading && data) {
            setGraphData(data);
        }
    }, [loading, data])

    return (
        <div className={"graph-data"}>
            {loading && <LinearProgress color="success"/>}
            {error && <Alert severity="error">{error.message}</Alert>}
            {graphData && <Graph graphResponseData={graphData} loading={loading}/>}
        </div>
    );
}