import React, { useRef, useState, useEffect } from "react";
import User from "../../../assets/superAdmin/Users IconW.svg";
import Email from "../../../assets/superAdmin/Mail Icon.svg";
import ImageIcon from "../../../assets/superAdmin/Image Icon.svg";
import AvatarM from "../../../assets/superAdmin/Avatar CircleM.svg";
import Pencil from '../../../assets/superAdmin/Pencil IconW.svg'

const PersonalInformation = () => {
    // ---- photo state + handlers ----
    const [photoUrl, setPhotoUrl] = useState(AvatarM); // preview src
    const [file, setFile] = useState(null); // selected file
    const inputRef = useRef(null);

    useEffect(() => {
        // cleanup blob URL
        return () => {
            if (
                file &&
                typeof photoUrl === "string" &&
                photoUrl.startsWith("blob:")
            ) {
                URL.revokeObjectURL(photoUrl);
            }
        };
    }, [file, photoUrl]);

    const openPicker = () => inputRef.current?.click();

    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;

        if (!/^image\/(png|jpe?g|gif|svg\+xml)$/i.test(f.type)) {
            alert("Please select an image file (SVG, PNG, JPG, or GIF).");
            return;
        }

        const url = URL.createObjectURL(f);
        setPhotoUrl(url);
        setFile(f);
    };

    const handleDelete = () => {
        if (file && photoUrl?.startsWith("blob:"))
            URL.revokeObjectURL(photoUrl);
        setFile(null);
        setPhotoUrl(AvatarM);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (!f) return;
        if (!/^image\/(png|jpe?g|gif|svg\+xml)$/i.test(f.type)) return;

        const url = URL.createObjectURL(f);
        setPhotoUrl(url);
        setFile(f);
        if (inputRef.current) inputRef.current.files = e.dataTransfer.files;
    };
    const stopDefaults = (e) => e.preventDefault();

    return (
        <div className="poppins flex flex-col gap-6">
            <div className="flex flex-col">
                <h1 className="text-white text-[16px] font-500">
                    Personal Information
                </h1>
                <h1 className="text-[#AEB9E1] text-[14px] font-500">
                    Lorem ipsum dolor sit amet consectetur adipiscing.
                </h1>
            </div>

            <div className="w-[600px] h-[513.5px] border border-[#343B4F] bg-[#0B1739] rounded-[5px] flex justify-center items-center">
                <div className="w-[533px] h-[445px] flex flex-col gap-8">
                    {/* Full name */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-row gap-1 items-center">
                                <img
                                    src={User}
                                    className="size-[12px]"
                                    alt=""
                                />
                                <h1 className="text-white text-[12px] font-500">
                                    Full name
                                </h1>
                            </div>
                            <input
                                placeholder="Jhon Carter"
                                className="w-[365px] text-[12px] text-[#ffffff] border border-[#343B4F] bg-[#0B1739] outline-none focus:border-[#343B4F] focus:ring-0"
                            />
                        </div>
                        <div className="w-full h-[1px] bg-[#343B4F]" />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-row gap-1 items-center">
                                <img
                                    src={Email}
                                    className="size-[12px]"
                                    alt=""
                                />
                                <h1 className="text-white text-[12px] font-500">
                                    Email address
                                </h1>
                            </div>
                            <input
                                placeholder="john@dashdark.com"
                                className="w-[365px] text-[12px] text-[#ffffff] border border-[#343B4F] bg-[#0B1739] outline-none focus:border-[#343B4F] focus:ring-0"
                            />
                        </div>
                        <div className="w-full h-[1px] bg-[#343B4F]" />
                    </div>

                    {/* Photo */}
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-row justify-between items-center">
                            {/* left label */}
                            <div className="flex flex-row gap-1 items-center">
                                <img
                                    src={ImageIcon}
                                    className="size-[12px]"
                                    alt="icon"
                                />
                                <h1 className="text-white text-[12px] font-500">
                                    Photo
                                </h1>
                            </div>

                            {/* right side (avatar + upload) */}
                            <div className="w-[365px] flex flex-row justify-between items-center">
                                {/* avatar + delete */}
                                <div className="flex flex-col items-center gap-4">
                                    <img
                                        src={photoUrl}
                                        className="w-12 h-12 rounded-full object-cover"
                                        alt="avatar"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="text-[#AEB9E1] text-[10px] font-medium hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>

                                {/* upload area */}
                                <div
                                    onClick={openPicker}
                                    onDrop={handleDrop}
                                    onDragOver={stopDefaults}
                                    onDragEnter={stopDefaults}
                                    className="cursor-pointer flex flex-col items-center justify-center text-center select-none"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) =>
                                        (e.key === "Enter" || e.key === " ") &&
                                        openPicker()
                                    }
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1B2134]">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-5 h-5 text-[#AEB9E1]"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm3 8l3.5-4.5 2.5 3 3.5-4.5L21 15M7 8h.01"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-[#AEB9E1] text-[12px] mt-1">
                                            <span className="text-[#5F8DFF]">
                                                Click to upload
                                            </span>{" "}
                                            or drag and drop
                                        </p>
                                        <p className="text-[#AEB9E1] text-[10px]">
                                            SVG, PNG, JPG or GIF (max. 800 ×
                                            400px)
                                        </p>
                                    </div>

                                    {/* hidden input */}
                                    <input
                                        ref={inputRef}
                                        id="file-upload"
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-[#343B4F]" />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-row gap-1 items-center">
                                <img
                                    src={Pencil}
                                    className="size-[12px]"
                                    alt="Email icon"
                                />
                                <h1 className="text-white text-[12px] font-500">
                                    Short description
                                </h1>
                            </div>
                            <textarea
                                placeholder="Write a short bio about you..."
                                className="w-[365px] max-h-[90px] min-h-[90px] text-[12px] text-[#ffffff] border border-[#343B4F] bg-[#0B1739] outline-none focus:border-[#343B4F] focus:ring-0 text-left p-2"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalInformation;
