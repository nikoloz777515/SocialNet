import React, { useState } from 'react';
import { Image, X, Send, Loader2 } from "lucide-react";
import { usePost } from "../context/PostContext";

const CreatePost = () => {
  const { createPost } = usePost();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return alert("შეავსეთ სათაური და კონტენტი");

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    
    if (file) {
      formData.append('postImage', file);
    }

    const result = await createPost(formData);

    if (result.success) {
      setTitle("");
      setContent("");
      setFile(null);
      setPreview(null);
    } else {
      alert("პოსტის შექმნა ვერ მოხერხდა: " + result.message);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-gray-100 mb-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="პოსტის სათაური..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-black placeholder:text-gray-200 text-gray-800 outline-none border-none bg-transparent"
          />
          
          <textarea
            placeholder="რაზე ფიქრობთ?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 text-xl text-gray-600 placeholder:text-gray-300 outline-none border-none resize-none bg-transparent"
          />
        </div>

  
        {preview && (
          <div className="relative rounded-3xl overflow-hidden group border border-gray-100">
            <img src={preview} alt="preview" className="w-full h-auto max-h-[400px] object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-black/70 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
          <label className="flex items-center gap-3 px-6 py-3 bg-gray-50 text-gray-600 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all font-bold">
            <Image size={20} className="text-indigo-500" />
            <span>ფოტოს დამატება</span>
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
            <span>გამოქვეყნება</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;