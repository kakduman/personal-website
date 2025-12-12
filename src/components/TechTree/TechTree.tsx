// v3.2: Tech Tree - Simple list-based UI
import React from 'react';
import { TECH_NODES, BRANCH_INFO, canResearchNode, getTechNode, TechBranch } from '../../data/techTree';
import './TechTree.css';

interface TechTreeProps {
  researchedNodes: string[];
  insight: number;
  onResearchNode: (nodeId: string) => void;
}

const TechTree: React.FC<TechTreeProps> = ({
  researchedNodes,
  insight,
  onResearchNode,
}) => {
  // Group nodes by branch
  const branches: TechBranch[] = ['foundation', 'efficiency', 'acceleration', 'automation', 'convergence'];
  
  const totalResearched = researchedNodes.length;
  const totalNodes = TECH_NODES.length;

  return (
    <div className="tech-tree-simple">
      <div className="tree-header">
        <h2>🧠 Tech Tree</h2>
        <div className="tree-resources">
          <span className="insight-display">💡 {Math.floor(insight)} Insight</span>
          <span className="progress-display">{totalResearched}/{totalNodes} Researched</span>
        </div>
      </div>

      <div className="branches-container">
        {branches.map(branch => {
          const branchInfo = BRANCH_INFO[branch];
          const branchNodes = TECH_NODES.filter(n => n.branch === branch);
          
          return (
            <div key={branch} className="branch-section" style={{ borderLeftColor: branchInfo.color }}>
              <div className="branch-header">
                <span className="branch-name" style={{ color: branchInfo.color }}>{branchInfo.name}</span>
                <span className="branch-desc">{branchInfo.description}</span>
              </div>
              
              <div className="branch-nodes">
                {branchNodes.map(node => {
                  const isResearched = researchedNodes.includes(node.id);
                  const { canResearch, reason } = canResearchNode(node.id, researchedNodes, insight);
                  
                  // Get prerequisite names for display
                  const prereqNames = node.prerequisites.map(prereqId => {
                    const prereq = getTechNode(prereqId);
                    const done = researchedNodes.includes(prereqId);
                    return { name: prereq?.name || prereqId, done };
                  });
                  
                  return (
                    <div 
                      key={node.id} 
                      className={`tech-node-row ${isResearched ? 'researched' : ''} ${canResearch ? 'available' : ''}`}
                    >
                      <div className="node-main">
                        <div className="node-status">
                          {isResearched ? '✅' : canResearch ? '🔓' : '🔒'}
                        </div>
                        <div className="node-info">
                          <div className="node-title">
                            <span className="node-name">{node.name}</span>
                            {!isResearched && node.cost > 0 && (
                              <span className={`node-cost ${insight >= node.cost ? 'affordable' : ''}`}>
                                {node.cost} 💡
                              </span>
                            )}
                            {!isResearched && node.cost === 0 && (
                              <span className="node-cost free">FREE</span>
                            )}
                          </div>
                          <div className="node-desc">{node.description}</div>
                          <div className="node-effects">
                            {node.effects.map((effect, i) => (
                              <span key={i} className="effect-badge">{effect.description}</span>
                            ))}
                          </div>
                          {prereqNames.length > 0 && !isResearched && (
                            <div className="node-prereqs">
                              Requires: {prereqNames.map((p, i) => (
                                <span key={i} className={p.done ? 'done' : ''}>
                                  {p.done ? '✓' : '○'} {p.name}{i < prereqNames.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {!isResearched && (
                        <button
                          className="research-btn"
                          onClick={() => onResearchNode(node.id)}
                          disabled={!canResearch}
                          title={!canResearch ? reason : 'Click to research'}
                        >
                          {canResearch ? 'Research' : (reason || 'Locked')}
                        </button>
                      )}
                      
                      {isResearched && (
                        <div className="researched-badge">✓ Done</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TechTree;
