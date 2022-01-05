import {gql, useQuery} from '@apollo/client';
import {Alert, FormGroup, LinearProgress} from '@mui/material';
import {useEffect, useState} from 'react';
import Gym from '../Gym/Gym';
import GymFormGroup from '../GymFormGroup/GymFormGroup';
import './GymList.css';

const GET_GYMS = gql`
    query GetGyms {
        revo_gyms {
            id
            name
        }
    }
`;

export interface GymData {
    id: number,
    name: string,
};

export default function GymList(): JSX.Element {
    const {loading, error, data} = useQuery(GET_GYMS);
    const [gyms, setGyms] = useState([]);
    const [enabledGyms, setEnabledGyms] = useState([1]);

    useEffect(() => {
        if (data) {
            setGyms(data.revo_gyms);
        }
    }, [data]);

    const handleToggle = (gymId: number) => {
        const containsGym = enabledGyms.includes(gymId);

        // If the gym is enabled, remove it from the list
        if (containsGym) {
            setEnabledGyms(enabledGyms.filter((id: number) => id !== gymId));
        } else {
            // Otherwise, add it to the list
            setEnabledGyms([...enabledGyms, gymId]);
        }
    };

    return (
        <div className={"gym-wrapper"}>
            {loading && <LinearProgress color="success"/>}
            {error && <Alert severity="error">{error.message}</Alert>}
            <div className={"enabled-gyms"}>
                {enabledGyms && enabledGyms.map((gymId: number) =>
                    <Gym key={gymId} gymId={gymId}/>
                )}
            </div>
            <div className={"gym-toggles"}>
                <FormGroup row>
                    {gyms && gyms.map((gym: GymData) =>
                        <GymFormGroup
                            key={gym.id}
                            gymName={gym.name}
                            gymId={gym.id}
                            onToggle={handleToggle}
                            defaultChecked={gym.id === 1}/>)}
                </FormGroup>
            </div>
        </div>
    );
}