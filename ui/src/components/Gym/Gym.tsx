import { gql, useQuery } from '@apollo/client';
import { Alert, LinearProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Graph from '../Graph/Graph';

const GET_GRAPH_DATA = gql`
  query GetGraphData($gymId: Int = 1) {
    revo_graph_data(where: {gym_id: {_eq: $gymId}}, order_by: {entry: desc}) {
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
  const [graphData, setGraphData] = useState(null);
  const { loading, error, data } = useQuery(GET_GRAPH_DATA, { variables: { gymId: props.gymId } });

  useEffect(() => {
    if (!loading && data) {
      setGraphData(data);
    }
  }, [loading, data])

  return (
    <div className={"graph-data"}>
      {loading && <LinearProgress color="success" />}
      {error && <Alert severity="error">{error.message}</Alert>}
      {graphData && <Graph graphResponseData={graphData} loading={loading}></Graph>}
    </div>
  );
}