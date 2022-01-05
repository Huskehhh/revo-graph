import React from 'react';
import GymList from '../GymList/GymList';
import './Home.css';

export default function Home() {
    return (
        <div className={"home-page"}>
            <GymList/>
        </div>
    )
}