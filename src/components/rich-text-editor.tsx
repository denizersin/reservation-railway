// import "./styles.css";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useState } from "react";

import "react-quill/dist/quill.snow.css";

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export default function RichTextEditor({
    value,
    onChange
}: Props) {
    const myColors = [
        "purple",
        "#785412",
        "#452632",
        "#856325",
        "#963254",
        "#254563",
        "white"
    ];
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ align: ["right", "center", "justify"] }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            [{ color: myColors }],
            [{ background: myColors }]
        ]
    };

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "link",
        "color",
        "image",
        "background",
        "align"
    ];

    const [code, setCode] = useState(
        "hello guys you can also add fonts and another features to this editor."
    );
    const handleProcedureContentChange = (content: any) => {
        setCode(content);
    };

    const ReactQuill = useMemo(() => dynamic(() => import('react-quill'), { ssr: false }),[]);

    return (
        <>
            {console.log(code)}
            <ReactQuill
                theme="snow"
                modules={modules}
                formats={formats}
                value={value}
                onChange={onChange}
            />
        </>
    );
}
