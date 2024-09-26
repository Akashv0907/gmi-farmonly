"use client";

import { CldVideoPlayer } from "next-cloudinary";


const TodaysHighlight = () => {
	return (
		<div className='w-full md:w-3/4 mx-auto'>
			<CldVideoPlayer width='960' height='540' className='rounded-md' 
			src='drone_video1_bo9snh' />
		</div>
	);
};
export default TodaysHighlight;
