// ========================= GROUPS =========================

import { useEffect, useState } from "react";
import { useGroup } from "../context/GroupContext";
import { useAuth } from "../context/AuthContext";

const Groups = () => {
  const { groups, loading, fetchGroups, createGroup, joinGroup } = useGroup();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await createGroup({
        title: name,
        description,
      });

      setName("");
      setDescription("");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">
        
     
        <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl p-6 shadow-2xl h-fit">
          <h2 className="text-2xl font-extrabold mb-6">
            Create Group
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              placeholder="Group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <textarea
              placeholder="Description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 outline-none min-h-[120px]"
            />

            <button className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 py-4 rounded-2xl font-bold hover:scale-[1.02] transition-all">
              Create Group
            </button>
          </form>
        </div>

        {/* Groups List */}
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-extrabold mb-8">
            Discover Groups
          </h2>

          {loading ? (
            <div className="text-center py-20 text-gray-400">
              Loading groups...
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {groups.map((group) => {
                const isMember = group.members?.some(
                  (m) => (m._id || m) === user?._id
                );

                const isOwner =
                  group.admin === user?._id ||
                  group.admin?._id === user?._id;

                return (
                  <div
                    key={group._id}
                    className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl p-6 shadow-xl hover:scale-[1.02] transition-all"
                  >
                    <div>
                      <h3 className="text-xl font-bold">
                        {group.title}
                      </h3>

                      <p className="text-gray-300 mt-3 text-sm">
                        {group.description || "No description"}
                      </p>
                    </div>

                    <div className="mt-6">
                      {isMember || isOwner ? (
                        <div className="bg-green-500/20 border border-green-500/20 text-green-400 text-center py-3 rounded-2xl font-semibold">
                          You are a member
                        </div>
                      ) : (
                        <button
                          onClick={() => joinGroup(group._id)}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 py-3 rounded-2xl font-bold hover:scale-[1.02] transition-all"
                        >
                          Join Group
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;